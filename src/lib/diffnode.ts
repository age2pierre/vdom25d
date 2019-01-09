import { Map, Set } from 'immutable'
import diff from 'immutable-diff'
import { createPath, groupByKey, VEmpty, VNative, VNode, VText } from './vdom'

export class SetAttribute {
  constructor(
    readonly key: string,
    readonly nextValue: any,
    readonly prevValue?: any, // FIXME: prevValue maynot be needed, check later or remove ?
  ) {}
}
export class RemoveAttribute {
  constructor(readonly key: string, readonly value: any) {}
}
export class InsertNode {
  constructor(readonly child: VNode, readonly nextPath: string) {}
}

export type IndexedActions = Map<number, DiffActions[]>
export class UpdateChildren {
  constructor(readonly indexedActions: IndexedActions) {}
}
export class ReplaceNode {
  constructor(
    readonly prevNode: VNode,
    readonly nextNode: VNode,
    readonly path: string,
  ) {}
}
export class RemoveNode {
  constructor(readonly prevNode: VNode) {}
}
export class SameNode {
  constructor() {}
}
export class UpdateThunk {
  constructor(
    readonly prevNode: VNode,
    readonly nextNode: VNode,
    readonly path: string,
  ) {}
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
): Array<DiffActions> {
  if (prev === next) {
    return [new SameNode()]
  }
  if (prev !== undefined && next === undefined) {
    return [new RemoveNode(prev)]
  }
  if (prev === undefined && next !== undefined) {
    return [new InsertNode(next, path)]
  }
  if (prev !== undefined && next !== undefined && prev.type !== next.type) {
    return [new ReplaceNode(prev, next, path)]
  }
  if (next instanceof VNative && prev instanceof VNative) {
    if (prev.tagName !== next.tagName) {
      return [new ReplaceNode(prev, next, path)]
    }
    const actions: Array<DiffActions> = diffAttributes(prev, next)
    if (prev.children !== next.children) {
      return actions.concat(new UpdateChildren(diffChildren(prev, next, path)))
    }
    return actions
  }
  if (next instanceof VText && prev instanceof VText) {
    if (prev.value !== next.value) {
      return [new SetAttribute('nodeValue', next.value, prev.value)]
    } else {
      return []
    }
  }
  // TODO handle Vthunk
  if (next instanceof VEmpty) {
    return []
  }
  throw new Error('Inexhaustive case')
}

export function diffAttributes(
  prev: VNative,
  next: VNative,
): Array<SetAttribute | RemoveAttribute> {
  const ops = diff(prev.attributes, next.attributes)
  return ops
    .map(op => {
      switch (op.get('op')) {
        case 'add':
          return new SetAttribute(op.get('path').get(0), op.get('value'))
        case 'replace':
          return new SetAttribute(op.get('path').get(0), op.get('value'))
        case 'remove':
          return new RemoveAttribute(op.get('path').get(0), op.get('value'))
        default:
          throw new Error('Inexhaustive switch case')
      }
    })
    .toArray()
}

function safe<T>(x: T) {
  return x as NonNullable<T>
}

export function diffChildren(
  prev: VNative,
  next: VNative,
  parentPath: string,
): IndexedActions {
  let actions: IndexedActions = Map()
  const prevChildrenByKey = groupByKey(prev.children)
  const nextChildrenByKey = groupByKey(next.children)
  const setOfKey = Set<string | number>(prevChildrenByKey.keys()).concat(
    nextChildrenByKey.keys(),
  )

  setOfKey.forEach(key => {
    const prev = prevChildrenByKey.get(key)
    const prevNode = prev ? safe(prev.get(0)).node : undefined

    const next = nextChildrenByKey.get(key)
    const nextNode = next ? safe(next.get(0)).node : undefined

    const index = prev ? safe(prev.get(0)).index : safe(safe(next).get(0)).index
    const nextPath = createPath(parentPath, key)

    const childActions = diffNode(prevNode, nextNode, nextPath)
    if (childActions.length > 0) {
      actions = actions.set(index, childActions)
    }
  })
  return actions
}
export default diffNode
