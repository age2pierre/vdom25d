import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import clock from './clock'
import diffNode from './diffnode'
import keyboard from './keyboard'
import patch from './patch'
import createThreeContext, { ThreeContext } from './three/driver'
import { VNative, VNode } from './vdom'

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

export default (idContainer = 'threeContainer') => {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  // tslint:disable-next-line: no-object-mutation
  renderer.shadowMap.enabled = true
  const container = document.getElementById(idContainer)
  if (!container) {
    throw Error(`Could not find HTML element ${idContainer}`)
  }
  container.appendChild(renderer.domElement)
  const context: ThreeContext = createThreeContext(renderer)

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
  )

  window.addEventListener('resize', () => {
    // tslint:disable-next-line: no-object-mutation
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  const keyboard$ = keyboard()
  const sources = clock().compose(sampleCombine(/*pick$, */ keyboard$))
  let i = 0

  return {
    run: (vdom$: Stream<VNode>): void => {
      vdom$
        .fold((ctx, nextRoot) => {
          ctx.renderer.render(ctx.refRoot as Scene, camera)
          const ops = diffNode(ctx.root, nextRoot, '0')
          return {
            ...ctx,
            refRoot: ops.reduce(
              (ref, action) => patch(ctx)(ref, action),
              ctx.refRoot,
            ),
            root: nextRoot,
          }
        }, context)
        .addListener({
          next: ctx => {
            // tslint:disable-next-line: no-console
            console.log(`frame ${i++}`)
          },
          error: err => {
            // tslint:disable-next-line: no-console
            console.error(err)
          },
        })
    },
    sources,
    context,
  }
}
