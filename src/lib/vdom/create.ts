import { Context } from '../makeapp'
import { assertNever } from '../utils'
import { createPath, VNative, VNode, VThunk } from './vdom'

export function createElement<T>(
  node: VNode,
  path: string,
  context: Context<T>,
): T {
  switch (node.type) {
    case 'empty':
      return context.emptyFactory(path)
    case 'native':
      return context.createNativeEl(node, path)
    case 'thunk':
      return createThunk(node, path, context)
    case 'text':
      throw Error('Text node are not yet implemented')
    default:
      throw assertNever(node)
  }
}

function createThunk<T, C extends Context<T>>(
  vnode: VThunk<C, any>,
  path: string,
  context: C,
): T {
  const output = vnode.fn(vnode.props, context)
  const key = (output as VNative).key || '0'
  const childPath = createPath(path, key)
  const el = createElement(output, childPath, context)
  return el
}
