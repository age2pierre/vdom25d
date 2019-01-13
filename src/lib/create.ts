import { Mesh, Node } from 'babylonjs'
import { Context, GridCoord } from './driver'
import { createPath, VNative, VNode, VThunk } from './vdom'

export function createElement(
  node: VNode,
  path: string,
  context: Context,
): Node | Error {
  switch (node.type) {
    case 'empty':
      return new Node('empty_' + path)
    case 'native':
      return createNativeElement(node, path, context)
    case 'thunk':
      return createThunk(node, path, context)
    default:
      return Error('Not yet implemented')
  }
}

function createNativeElement(
  vnode: VNative,
  path: string,
  context: Context,
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

function createThunk(
  vnode: VThunk<any>,
  path: string,
  context: Context,
): Node | Error {
  // const { onCreate } = vnode.props
  const output = vnode.fn(vnode.props, context)
  const key = (output as VNative).key || '0'
  const childPath = createPath(path, key)
  const el = createElement(output, childPath, context)
  // if (onCreate) dispatch(onCreate(model))
  // vnode.state = {
  //   vnode: output,
  //   props: vnode.props,
  // }
  return el
}
