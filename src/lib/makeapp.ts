// tslint:disable:no-object-mutation
import {
  Engine,
  Mesh,
  MeshBuilder,
  Plane,
  Scene,
  TargetCamera,
  Vector3,
} from 'babylonjs'
import 'babylonjs-materials'
import { GridMaterial, SkyMaterial } from 'babylonjs-materials'
import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import createBabylonContext, { BabylonContext } from './babylon/driver'
import clock from './clock'
import diffNode from './diffnode'
import keyboard from './keyboard'
import patch from './patch'
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
  readonly createNativeEl: (vnode: VNative, path: string) => T
  readonly dispatch: (arg: any) => any
  readonly getChildren: (ref: T) => T[]
  readonly getParent: (ref: T) => T
  readonly replaceChild: (parent: T, oldRef: T, newRef: T) => T
  readonly removeChild: (parent: T, oldRef: T) => T
  readonly insertAtIndex: (parent: T, index: number, ref: T) => T
  readonly updateAttribute: (
    ref: T,
    key: string,
    tag: keyof JSX.IntrinsicElements | undefined,
    newVal: any,
    oldVal: any,
  ) => T
}

const XYPlane = new Plane(0, 0, 1, 0)

// TODO move into comp
const cameraFactory = (
  scene: Scene,
  distance: number = 10,
  x: number = 5,
  y: number = 5,
  fov: number = 60,
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

// TODO move into comp
const skyboxFactory = (scene: Scene) => {
  const skybox = Mesh.CreateBox('skyBox', 1000.0, scene)
  const skyboxMaterial = new SkyMaterial('skyMaterial', scene)
  skyboxMaterial.backFaceCulling = false
  skybox.material = skyboxMaterial
  return skybox
}

export default (idContainer = 'renderCanvas') => {
  const engine = new Engine(document.getElementById(
    idContainer,
  ) as HTMLCanvasElement)
  const context: BabylonContext = createBabylonContext(engine)
  cameraFactory(context.scene)
  const grid = gridFactory(context.scene)
  skyboxFactory(context.scene)

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
    sinks: {
      babylon: (vdom$: Stream<VNode>): void => {
        vdom$.fold((ctx, nextRoot) => {
          ctx.scene.render()
          const ops = diffNode(ctx.root, nextRoot, '0')
          return {
            ...ctx,
            refRoot: ops.reduce(patch(ctx), ctx.refRoot),
            root: nextRoot,
          }
        }, context)
      },
    },
    sources: clock().compose(sampleCombine(pick$, keyboard$)),
    context,
  }
}
