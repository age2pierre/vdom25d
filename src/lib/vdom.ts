import { List, Map } from 'immutable'
import { ImmutableMap } from './immutablemap'

export type VNode = VNative | VThunk | VEmpty | VText

export interface VNative
  extends ImmutableMap<{
    type: 'native'
    tagName: string
    attributes?: Map<any, any>
    key?: string
    children?: List<VNode>
  }> {}

export function isVNative(arg: any): arg is VNative {
  return arg.type === 'native'
}

export interface VThunk
  extends ImmutableMap<{
    type: 'thunk'
    fn: Function
    attributes?: Map<string, any>
    key?: string
    children?: List<VNode>
  }> {}

export function isVThunk(arg: any): arg is VThunk {
  return arg.type === 'thunk'
}

export interface VText
  extends ImmutableMap<{
    type: 'text'
    value: string | number
  }> {}

export function isVText(arg: any): arg is VText {
  return arg.type === 'text'
}

export interface VEmpty
  extends ImmutableMap<{
    type: 'empty'
  }> {}

export function isVEmpty(arg: any): arg is VEmpty {
  return arg.type === 'empty'
}

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
  let key = undefined
  if (attributesArg) {
    key = attributesArg.key ? attributesArg.key : undefined
    delete attributesArg.key
  }

  const children = childrenArray.reduce(reduceChildren, List())

  if (tag instanceof Function) {
    return Map({
      type: 'thunk',
      fn: tag,
      attributes: attributesArg ? Map(attributesArg) : undefined,
      key,
      children,
    })
  } else {
    return Map({
      type: 'native',
      tagName: tag,
      attributes: attributesArg ? Map(attributesArg) : undefined,
      key,
      children,
    })
  }
}

function reduceChildren(children: List<VNode>, child: Children): List<VNode> {
  if (typeof child === 'string' || typeof child === 'number') {
    return children.push(
      Map({
        type: 'text',
        value: child,
      }),
    )
  } else if (child === null) {
    return children.push(
      Map({
        type: 'empty',
      }),
    )
  } else if (child instanceof Array) {
    return children.concat(child.reduce(reduceChildren, List()))
  } else if (typeof child === 'undefined') {
    throw new Error(`Vnode can't be undefined. Did you mean to use null?`)
  } else {
    return children.push(child)
  }
}
