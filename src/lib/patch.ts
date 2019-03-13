import diffNode, {
  DiffActions,
  InsertNode,
  RemoveAttribute,
  RemoveNode,
  ReplaceNode,
  SetAttribute,
  UpdateChildren,
  UpdateThunk,
} from './diffnode'
import { Context } from './makeapp'
import { createPath, isVNative, isVThunk, VNative, VNode } from './vdom'

export default function updateElement<T>(
  ctx: Context<T>,
): (n: T, a: DiffActions) => T {
  return (node, action) => {
    switch (action.action) {
      case 'same_node':
        return node
      case 'set_attribute':
        return setAttribute(node, action, ctx)
      case 'remove_attribute':
        return removeAttribute(node, action, ctx)
      case 'insert_node':
        return insertNode(node, action, ctx)
      case 'update_chilren':
        return updateChildren(node, action, ctx)
      case 'update_thunk':
        return updateThunk(node, action, ctx)
      case 'replace_node':
        return replaceNode(node, action, ctx)
      case 'remove_node':
        return removeNode(node, action, ctx)
      default:
        throw Error('Unhandle Diff actions')
    }
  }
}

function setAttribute<T>(node: T, action: SetAttribute, ctx: Context<T>): T {
  return (
    ctx.updateAttribute(
      node,
      action.key,
      action.tag as any,
      action.nextValue,
      (node as any)[action.key],
    ) && node
  )
}

function removeAttribute<T>(
  node: T,
  action: RemoveAttribute,
  ctx: Context<T>,
): T {
  return (
    ctx.updateAttribute(
      node,
      action.key,
      action.tag as any,
      null,
      (node as any)[action.key],
    ) && node
  )
}

function insertNode<T>(node: T, action: InsertNode, ctx: Context<T>): T {
  const parent = ctx.getParent(node)
  return ctx.insertAtIndex(parent, 0, node) && node // TODO fix path
}

function updateChildren<T>(
  node: T,
  action: UpdateChildren,
  ctx: Context<T>,
): T {
  const children = [...ctx.getChildren(node)]
  Object.keys(action.indexedActions)
    .map(key => Number(key))
    .forEach(index => {
      const actions = action.indexedActions[index]
      actions.forEach(childAction =>
        updateElement(ctx)(children[index], childAction),
      )
    })
  return node
}

function updateThunk<T>(node: T, action: UpdateThunk, ctx: Context<T>): T {
  const nextNode = action.nextNode.fn(action.nextNode.props)
  const actions = diffNode(
    action.prevNode,
    nextNode,
    createPath(action.path, '0'),
  )
  const nextRef = actions.reduce(updateElement(ctx), node)
  return nextRef
}

function replaceNode<T>(node: T, action: ReplaceNode, ctx: Context<T>): T {
  const { nextNode, prevNode, path } = action
  const newRef = ctx.createNativeEl(nextNode as VNative, path)
  const parent = ctx.getParent(node)
  if (parent) {
    ctx.replaceChild(parent, node, newRef)
  }
  removeThunks(prevNode, ctx)
  return newRef
}

function removeNode<T>(node: T, action: RemoveNode, ctx: Context<T>): T {
  removeThunks(action.prevNode, ctx)
  const parent = ctx.getParent(node)
  ctx.removeChild(parent, node)
  return node
}

function removeThunks<T>(vnode: VNode, ctx: Context<T>): void {
  while (isVThunk(vnode)) {
    const { onCreate, onDestroy, onUpdate, ...props } = vnode.props
    if (onDestroy) {
      ctx.dispatch(
        onDestroy({
          props,
          ctx,
        }),
      )
    }
  }
  if ((isVThunk(vnode) || isVNative(vnode)) && vnode.children) {
    vnode.children.forEach(child => removeThunks(child, ctx))
  }
}
