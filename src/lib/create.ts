import { Mesh, Node } from 'babylonjs'
import { Context, GridCoord } from './driver'
import { ImmutableMap } from './immutablemap'
import { createPath, VNative, VNode } from './vdom'

export function createElement(node: VNode, path: string, context: Context) {
  switch (node.type) {
    case 'empty':
      return new Node('empty_' + path)
    case 'native':
      return createNativeElement(node, path, context)
    default:
      throw Error('Not yet implemented')
  }
}

function createNativeElement(vnode: VNative, path: string, context: Context) {
  const { tagName, attributes, children } = vnode
  let el: Node
  if (tagName === 'box') {
    const props = attributes as ImmutableMap<GridCoord>
    const box = Mesh.CreateBox('box', 1, context.scene)
    box.isPickable = false
    box.position.x = props.get('x')
    box.position.y = props.get('y')
    el = box
  } else {
    throw Error('Not yet implemented')
  }

  children.forEach((node, index) => {
    const key = node.type === 'native' ? node.key : false
    const childPath = createPath(path, key || index)
    const child = createElement(node, childPath, context)
    if (child instanceof Node) {
      child.parent = el
    }
  })

  return el
}
