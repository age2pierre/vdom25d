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
import clock from './clock'
import keyboard from './keyboard'
import { VEmpty, VNode } from './vdom'

// Up         0  1  0
// Down       0 -1  0
// Forward    0  0  1
// Backward   0  0 -1
// Left      -1  0  0
// Right      1  0  0

export interface GridCoord {
  x: number
  y: number
}

export interface Context {
  scene: Scene
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

  const scene = new Scene(engine)
  const camera = cameraFactory(scene)
  const grid = gridFactory(scene)
  const skybox = skyboxFactory(scene)
  const context: Context = {
    scene,
  }

  window.addEventListener('resize', () => {
    engine.resize()
  })

  const pick = xs.create<GridCoord>({
    start: listener => {
      scene.onPointerDown = function(_, pickResult) {
        // if the click hits the grid object, we emit event
        if (pickResult.hit && pickResult.pickedMesh === grid) {
          listener.next({
            x: pickResult.pickedPoint!.x,
            y: pickResult.pickedPoint!.y,
          })
        }
      }
    },
    stop: () => {},
  })

  return {
    sink: (vdom$: Stream<VNode>): void => {
      vdom$.fold(
        ({ context, root: prevRoot }, nextRoot) => {
          context.scene.render()
          const root = nextRoot
          return { context, root }
        },
        {
          context,
          root: new VEmpty() as VNode,
        },
      )
    },
    source: clock().compose(sampleCombine(pick, keyboard())),
  }
}
