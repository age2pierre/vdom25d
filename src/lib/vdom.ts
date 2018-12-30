import { List, Map, Record } from 'immutable'

export type VNode = VNative | VEmpty | VText

type VNodeTypes = 'native' | 'empty' | 'text'

interface VNodeBase {
  type: VNodeTypes
}

interface VNativeBase extends VNodeBase {
  type: 'native'
  tagName: string | undefined
  attributes: Map<string, any>
  key: string | number | undefined
  children: List<VNode>
}
export class VNative extends Record<VNativeBase>({
  type: 'native',
  tagName: undefined,
  attributes: Map({}),
  key: undefined,
  children: List<VNode>(),
}) {}

interface VTextBase extends VNodeBase {
  type: 'text'
  value: string | number | undefined
}
export class VText extends Record<VTextBase>({
  type: 'text',
  value: undefined,
}) {}

export class VEmpty extends Record<VNodeBase>({
  type: 'empty',
}) {}

type Children = VNode | number | string | null | ChildrenArray
interface ChildrenArray extends Array<Children> {}
type Attributes = {
  key?: string | number
  [k: string]: any
}

export function h(
  tag: string | Function,
  attributesArg?: Attributes,
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
