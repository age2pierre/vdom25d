import { PerspectiveCamera, WebGLRenderer } from 'three'
import { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import clock, { Clock } from './drivers/clock'
import keyboard from './drivers/keyboard'
import createThreeContext, { ThreeContext } from './three/driver'
import NullRenderer from './three/nullRenderer'
import { noop } from './utils'
import diffNode from './vdom/diffnode'
import patch from './vdom/patch'
import { VNative, VNode } from './vdom/vdom'

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
    oldAttr: any,
  ) => T
}

export type Sources = Stream<[Clock, KeyboardEvent]>

export default (idContainer = 'threeContainer', useNullRenderer = false) => {
  const renderer = useNullRenderer
    ? new NullRenderer()
    : new WebGLRenderer({
        antialias: true,
        alpha: true,
      })
  if (!useNullRenderer && renderer instanceof WebGLRenderer) {
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    // tslint:disable-next-line: no-object-mutation
    renderer.shadowMap.enabled = true
    const container = document.getElementById(idContainer)
    if (!container) {
      throw Error(`Could not find HTML element ${idContainer}`)
    }
    container.appendChild(renderer.domElement)
  }
  const context: ThreeContext = createThreeContext(renderer)

  const camera = new PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
  )

  camera.position.setZ(25)

  if (!useNullRenderer && renderer instanceof WebGLRenderer) {
    window.addEventListener('resize', () => {
      // tslint:disable-next-line: no-object-mutation
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }

  const keyboard$ = keyboard()
  const sources$: Sources = clock().compose(
    sampleCombine(/*pick$, */ keyboard$),
  )

  return {
    run: (vdom$: Stream<VNode>): void => {
      vdom$
        .fold((ctx, nextRoot) => {
          ctx.renderer.render(ctx.scene, camera)
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
          next: _ctx => {
            noop()
          },
          error: err => {
            // tslint:disable-next-line: no-console
            console.error(err)
          },
        })
    },
    sources: sources$,
    context,
  }
}
