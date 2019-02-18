// tslint:disable:no-object-mutation
import {
  Engine,
  GridMaterial,
  Mesh,
  MeshBuilder,
  Plane,
  Scene,
  TargetCamera,
  Vector3,
} from 'babylonjs'
import 'babylonjs-materials'
import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { BabylonContext, createBabylonContext } from './babylondriver'
import clock from './clock'
import diffNode from './diffnode'
import keyboard from './keyboard'
import patch from './patch'
import { ErrorLogger } from './utils'
import { VNative, VNode } from './vdom'

// Up         0  1  0
// Down       0 -1  0
// Forward    0  0  1
// Backward   0  0 -1
// Left      -1  0  0
// Right      1  0  0

export interface GridCoord {
  readonly x: number
  readonly y: number
}

export interface Context<T> {
  readonly refRoot: T
  readonly root: VNode
  // tslint:disable-next-line:no-mixed-interface
  readonly emptyFactory: (path: string) => T
  readonly createNativeEl: (
    vnode: VNative,
    path: string,
    context: Context<T>,
  ) => T | Error
  readonly getChildren: (ref: T) => T[]
  readonly getParent: (ref: T) => T
  readonly replaceChild: (parent: T, oldRef: T, newRef: T) => true | Error
  readonly removeChild: (parent: T, oldRef: T) => true | Error
  readonly insertAtIndex: (parent: T, index: number, ref: T) => true | Error
  readonly attributesUpdater: (
    ref: T,
    key: string,
    newVal: any,
    oldVal: any,
  ) => true | Error
}

const XYPlane = new Plane(0, 0, 1, 0)

const cameraFactory = (
  scene: Scene,
  distance: number = 10,
  x: number = 5,
  y: number = 5,
  fov: number = 30,
) => {
  const camera = new TargetCamera(
    'mainCamera',
    new Vector3(x, y, distance),
    scene,
  )
  camera.fov = fov
  return camera
}

const gridFactory = (scene: Scene, width: number = 10, height: number = 10) => {
  const gridMesh = MeshBuilder.CreatePlane(
    'gridMesh',
    {
      width,
      height,
      sourcePlane: XYPlane,
    },
    scene,
  )
  gridMesh.isPickable = true
  const gridMaterial = new GridMaterial('gridMaterial', scene)
  gridMaterial.gridRatio = 1
  gridMesh.material = gridMaterial
  return gridMesh
}

const skyboxFactory = (scene: Scene) => {
  const skybox = Mesh.CreateBox('skyBox', 1000.0, scene)
  const skyboxMaterial = new BABYLON.SkyMaterial('skyMaterial', scene)
  skyboxMaterial.backFaceCulling = false
  skybox.material = skyboxMaterial
  return skybox
}

export default (idContainer = 'renderCanvas') => {
  const engine = new Engine(document.getElementById(
    idContainer,
  ) as HTMLCanvasElement)
  const context: BabylonContext = createBabylonContext(engine)
  // const camera = cameraFactory(context.scene)
  const grid = gridFactory(context.scene)
  // const skybox = skyboxFactory(context.scene)

  window.addEventListener('resize', () => {
    engine.resize()
  })

  const pick$ = xs.create<GridCoord>({
    start: listener => {
      context.scene.onPointerDown = (_, pickResult) => {
        // if the click hits the grid object, we emit event
        if (pickResult.hit && pickResult.pickedMesh === grid) {
          listener.next({
            x: pickResult.pickedPoint!.x,
            y: pickResult.pickedPoint!.y,
          })
        }
      }
    },
    stop: () => {
      return
    },
  })

  const keyboard$ = keyboard()

  return {
    sink: (vdom$: Stream<VNode>): void => {
      vdom$.fold((ctx, nextRoot) => {
        ctx.scene.render()
        const ops = diffNode(ctx.root, nextRoot, '0')
        return {
          ...ctx,
          refRoot: ops.reduce(
            ErrorLogger(patch(ctx), ctx.refRoot),
            ctx.refRoot,
          ),
          root: nextRoot,
        }
      }, context)
    },
    source: clock().compose(sampleCombine(pick$, keyboard$)),
  }
}
