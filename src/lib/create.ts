import { Context } from './makeapp'
import { createPath, VNative, VNode, VThunk } from './vdom'

export function createElement<T>(
  node: VNode,
  path: string,
  context: Context<T>,
): T | Error {
  switch (node.type) {
    case 'empty':
      return context.emptyFactory(path)
    case 'native':
      return context.createNativeEl(node, path, context)
    case 'thunk':
      return createThunk(node, path, context)
    default:
      return Error('Not yet implemented')
  }
}

function createThunk<T>(
  vnode: VThunk<any>,
  path: string,
  context: Context<T>,
): T | Error {
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
