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
  readonly key: string
  readonly nextValue: any
  readonly prevValue?: any // FIXME: prevValue maynot be needed, check later or remove ?
}

export interface RemoveAttribute {
  readonly action: 'remove_attribute'
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
  readonly prevNode: VThunk<any>
  readonly nextNode: VThunk<any>
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
          key: 'nodeValue',
          nextValue: next.value,
          prevValue: prev.value,
        },
      ]
    } else {
      return []
    }
  }
  if (isVThunk(next)) {
    if (isVThunk(prev) && prev === next) {
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

  const mutableOps: Array<SetAttribute | RemoveAttribute> = []

  setOfKey.forEach(key => {
    if (!(key in prev.attributes)) {
      mutableOps.push({
        action: 'set_attribute',
        key,
        nextValue: next.attributes[key],
      })
    } else if (!(key in next.attributes)) {
      mutableOps.push({
        action: 'remove_attribute',
        key,
        value: prev.attributes[key],
      })
    } else if (prev.attributes[key] !== next.attributes[key]) {
      mutableOps.push({
        action: 'set_attribute',
        key,
        nextValue: next.attributes[key],
        prevValue: prev.attributes[key],
      })
    }
  })

  return mutableOps
}

export function diffChildren(
  prev: VNative,
  next: VNative,
  parentPath: string,
): IndexedActions {
  const mutableActions: IndexedActions = {}
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
      mutableActions[index] = childActions
    }
  })
  return mutableActions
}
export default diffNode
