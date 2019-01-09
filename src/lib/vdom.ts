import { List, Map, Record } from 'immutable'

export type VNode = VNative | VEmpty | VText

type VNodeTypes = 'native' | 'empty' | 'text'

export type Attributes = Map<string, any>

interface VNodeBase {
  type: VNodeTypes
}

interface VNativeBase extends VNodeBase {
  type: 'native'
  tagName: string | undefined
  attributes: Attributes
  key: string | number | undefined
  children: List<VNode>
}
export class VNative extends Record<VNativeBase>({
  type: 'native',
  tagName: undefined,
  attributes: Map({}),
  key: undefined,
  children: List<VNode>(),
}) {
  constructor(arg: Partial<VNativeBase>) {
    super(arg)
  }
}

interface VTextBase extends VNodeBase {
  type: 'text'
  value: string | number | undefined
}
export class VText extends Record<VTextBase>({
  type: 'text',
  value: undefined,
}) {
  constructor(arg: Partial<VTextBase>) {
    super(arg)
  }
}

interface VEmptyBase extends VNodeBase {
  type: 'empty'
}
export class VEmpty extends Record<VEmptyBase>({
  type: 'empty',
}) {
  constructor() {
    super()
  }
}

type Children = VNode | number | string | null | ChildrenArray
interface ChildrenArray extends Array<Children> {}
type AttributesJS = {
  key?: string | number
  [k: string]: any
}

export function h(
  tag: string | Function,
  attributesArg?: AttributesJS,
  ...childrenArray: Array<Children>
): VNode {
  if (tag instanceof Function) {
    return tag(attributesArg)
  }

  let key = undefined
  if (attributesArg) {
    key = attributesArg.key ? attributesArg.key : undefined
    delete attributesArg.key
  }

  const children = childrenArray.reduce(reduceChildren, List())

  return new VNative({
    tagName: tag,
    attributes: attributesArg ? Map(attributesArg) : undefined,
    key,
    children,
  })
}

function reduceChildren(children: List<VNode>, child: Children): List<VNode> {
  if (typeof child === 'string' || typeof child === 'number') {
    return children.push(
      new VText({
        value: child,
      }),
    )
  } else if (child === null) {
    return children.push(new VEmpty())
  } else if (child instanceof Array) {
    return children.concat(child.reduce(reduceChildren, List()))
  } else if (typeof child === 'undefined') {
    throw new Error(`VNode can't be undefined. Did you mean to use null?`)
  } else {
    return children.push(child)
  }
}

export function createPath(...args: (string | number)[]) {
  return args.join('.')
}

export function groupByKey(children: List<VNode>) {
  return children
    .map((node, index) => ({
      node,
      index,
    }))
    .groupBy(item => {
      const key = item.node.type === 'native' ? item.node.key : null
      return key || item.index
    })
}
