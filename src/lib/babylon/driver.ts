import { Engine, Node, Scene, TransformNode } from 'babylonjs'
import { createElement } from '../create'
import { Context } from '../makeapp'
import { assertNever } from '../utils'
import { createPath, VEmpty, VNative } from '../vdom'
import { BoxProps } from './api'
import box from './box'

export interface BabylonContext extends Context<Node> {
  readonly scene: Scene
}

export interface ElementDriver<Ref extends T, Props, C extends Context<T>, T> {
  readonly factory: (attr: Props, ctx: C) => Ref
  readonly update: (
    ref: Ref,
    key: keyof Props,
    newVal: Props[keyof Props],
    oldVal: Props[keyof Props],
    ctx: C,
  ) => Ref
}

function createBabylonElement(
  vnode: VNative,
  path: string,
  context: BabylonContext,
): Node {
  const { tagName, attributes, children } = vnode
  let el: Node
  switch (tagName) {
    case 'box':
      el = box.factory(attributes as BoxProps, context)
      break
    case 'group':
      el = new Node('_')
      break
    case undefined:
    case 'tag':
      throw Error("Tagname shouldn't be undefined")
    default:
      throw assertNever(tagName)
  }
  children.forEach((node, index) => {
    const key = node.type === 'native' ? node.key : false
    const childPath = createPath(path, key || index)
    const mutableChild = createElement(node, childPath, context)
    if (mutableChild instanceof Node) {
      mutableChild.parent = el
    }
  })

  return el
}

function updateAttributes(
  ref: Node,
  key: string,
  newVal: any,
  oldVal: any,
): Node {
  try {
    // tslint:disable-next-line:no-object-mutation
    ;(ref as any)[key] = newVal
    return ref
  } catch (err) {
    throw err
  }
}

export default function createBabylonContext(engine: Engine): BabylonContext {
  const scene = new Scene(engine)
  const refRoot = new Node('root', scene)
  const context: BabylonContext = {
    scene,
    refRoot,
    root: VEmpty(),
    emptyFactory: path => new Node('empty_' + path),
    dispatch: e => {
      // tslint:disable-next-line:no-console
      console.warn('Dispatch not yet implemented ' + JSON.stringify(e))
    },
    createNativeEl: (vnode, path, ctx) =>
      createBabylonElement(vnode, path, ctx as BabylonContext),
    getChildren: node => node.getChildren(),
    getParent: node => node.parent || refRoot,
    replaceChild: (parent, oldRef, newRef) => {
      return (
        context.removeChild(parent, oldRef) &&
        context.insertAtIndex(parent, 0, newRef)
      )
    },
    removeChild: (parent, oldRef) => {
      if (oldRef instanceof TransformNode) {
        oldRef.setParent(null)
      } else {
        // tslint:disable-next-line:no-object-mutation
        oldRef.parent = null
      }
      return oldRef
    },
    insertAtIndex: (parent, index, ref) => {
      if (ref instanceof TransformNode) {
        ref.setParent(parent)
      } else {
        // tslint:disable-next-line:no-object-mutation
        ref.parent = parent
      }
      return ref
    },
    updateAttribute: updateAttributes,
  }
  return context
}
