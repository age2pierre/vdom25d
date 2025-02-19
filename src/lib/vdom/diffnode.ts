import {
  createPath,
  groupByKey,
  isVEmpty,
  isVNative,
  isVText,
  isVThunk,
  VNative,
  VNode,
  VThunk,
} from './vdom'

export interface SetAttribute {
  readonly action: 'set_attribute'
  readonly tag?: string
  readonly key: string
  readonly nextValue: any
  readonly prevAttr?: any
}

export interface RemoveAttribute {
  readonly action: 'remove_attribute'
  readonly tag?: string
  readonly key: string
  readonly value?: any
}
export interface InsertNode {
  readonly action: 'insert_node'
  readonly child: VNode
  readonly nextPath: string
}

export interface IndexedActions {
  // tslint:disable-next-line:readonly-keyword
  [key: number]: ReadonlyArray<DiffActions>
}

export interface UpdateChildren {
  readonly action: 'update_chilren'
  readonly indexedActions: IndexedActions
}
export interface ReplaceNode {
  readonly action: 'replace_node'
  readonly prevNode: VNode
  readonly nextNode: VNode
  readonly path: string
}
export interface RemoveNode {
  readonly action: 'remove_node'
  readonly prevNode: VNode
}
export interface SameNode {
  readonly action: 'same_node'
}
export interface UpdateThunk {
  readonly action: 'update_thunk'
  readonly prevNode: VThunk<any, any>
  readonly nextNode: VThunk<any, any>
  readonly path: string
}

export type DiffActions =
  | SetAttribute
  | RemoveAttribute
  | InsertNode
  | ReplaceNode
  | UpdateChildren
  | RemoveNode
  | SameNode
  | UpdateThunk

export function diffNode(
  prev: VNode | undefined,
  next: VNode | undefined,
  path: string,
): ReadonlyArray<DiffActions> {
  if (prev === next) {
    return [
      {
        action: 'same_node',
      },
    ]
  }
  if (prev !== undefined && next === undefined) {
    return [
      {
        action: 'remove_node',
        prevNode: prev,
      },
    ]
  }
  if (prev === undefined && next !== undefined) {
    return [
      {
        action: 'insert_node',
        child: next,
        nextPath: path,
      },
    ]
  }
  if (prev !== undefined && next !== undefined && prev.type !== next.type) {
    return [
      {
        action: 'replace_node',
        prevNode: prev,
        nextNode: next,
        path,
      },
    ]
  }
  if (isVNative(next) && isVNative(prev)) {
    if (prev.tagName !== next.tagName) {
      return [
        {
          action: 'replace_node',
          prevNode: prev,
          nextNode: next,
          path,
        },
      ]
    }
    const actions: ReadonlyArray<DiffActions> = diffAttributes(prev, next)
    if (prev.children !== next.children) {
      const indexedActions = diffChildren(prev, next, path)
      if (Object.keys(indexedActions).length > 0) {
        return actions.concat({
          action: 'update_chilren',
          indexedActions,
        })
      }
    }
    return actions
  }
  if (isVText(prev) && isVText(next)) {
    if (prev.value !== next.value) {
      return [
        {
          action: 'set_attribute',
          tag: undefined,
          key: 'nodeValue',
          nextValue: next.value,
          prevAttr: prev.value,
        },
      ]
    } else {
      return []
    }
  }
  if (isVThunk(next)) {
    if (isVThunk(prev) && prev.fn === next.fn && prev.props !== next.props) {
      return [
        {
          action: 'update_thunk',
          prevNode: prev,
          nextNode: next,
          path,
        },
      ]
    } else if (prev !== undefined) {
      return [
        {
          action: 'replace_node',
          prevNode: prev,
          nextNode: next,
          path,
        },
      ]
    }
  }
  if (isVEmpty(next)) {
    return []
  }
  throw new Error('Inexhaustive case')
}

export function diffAttributes(
  prev: VNative,
  next: VNative,
): ReadonlyArray<SetAttribute | RemoveAttribute> {
  const setOfKey = new Set([
    ...Object.keys(prev.attributes),
    ...Object.keys(next.attributes),
  ])

  const mut_ops: Array<SetAttribute | RemoveAttribute> = []

  setOfKey.forEach(key => {
    if (!(key in prev.attributes)) {
      mut_ops.push({
        action: 'set_attribute',
        tag: next.tagName,
        key,
        nextValue: next.attributes[key],
      })
    } else if (!(key in next.attributes)) {
      mut_ops.push({
        action: 'remove_attribute',
        tag: next.tagName,
        key,
        value: prev.attributes[key],
      })
    } else if (prev.attributes[key] !== next.attributes[key]) {
      mut_ops.push({
        action: 'set_attribute',
        tag: next.tagName,
        key,
        nextValue: next.attributes[key],
        prevAttr: prev.attributes,
      })
    }
  })

  return mut_ops
}

export function diffChildren(
  prev: VNative,
  next: VNative,
  parentPath: string,
): IndexedActions {
  const mut_actions: IndexedActions = {}
  const prevChildrenByKey = groupByKey(prev.children)
  const nextChildrenByKey = groupByKey(next.children)
  const setOfKey = new Set([
    ...Object.keys(prevChildrenByKey),
    ...Object.keys(nextChildrenByKey),
  ])

  setOfKey.forEach(key => {
    const prevNode = prevChildrenByKey[key]
      ? prevChildrenByKey[key].node
      : undefined
    const nextNode = nextChildrenByKey[key]
      ? nextChildrenByKey[key].node
      : undefined

    const index = prevNode
      ? prevChildrenByKey[key].index
      : nextChildrenByKey[key].index
    const nextPath = createPath(parentPath, key)

    const childActions = diffNode(prevNode, nextNode, nextPath)
    if (childActions.length > 0) {
      mut_actions[index] = childActions
    }
  })
  return mut_actions
}
export default diffNode
