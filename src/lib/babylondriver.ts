import { Engine, Mesh, Node, Scene, TransformNode } from 'babylonjs'
import { createElement } from './create'
import { Context, GridCoord } from './makeapp'
import { createPath, VEmpty, VNative } from './vdom'

export interface BabylonContext extends Context<Node> {
  readonly scene: Scene
}

function createBabylonElement(
  vnode: VNative,
  path: string,
  context: BabylonContext,
): Node | Error {
  const { tagName, attributes, children } = vnode
  let el: Node
  if (tagName === 'box') {
    const props = attributes as GridCoord
    const mutableBox = Mesh.CreateBox('box', 1, context.scene)
    mutableBox.isPickable = false
    mutableBox.position.x = props.x
    mutableBox.position.y = props.y
    el = mutableBox
  } else {
    return Error('Not yet implemented')
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
): true | Error {
  try {
    // tslint:disable-next-line:no-object-mutation
    ;(ref as any)[key] = newVal
    return true
  } catch (err) {
    return err
  }
}

export function createBabylonContext(engine: Engine): BabylonContext {
  const scene = new Scene(engine)
  const refRoot = new Node('root', scene)
  const context: BabylonContext = {
    scene,
    refRoot,
    root: VEmpty(),
    emptyFactory: path => new Node('empty_' + path),
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
      return true
    },
    insertAtIndex: (parent, index, ref) => {
      if (ref instanceof TransformNode) {
        ref.setParent(parent)
      } else {
        // tslint:disable-next-line:no-object-mutation
        ref.parent = parent
      }
      return true
    },
    attributesUpdater: updateAttributes,
  }
  return context
}
