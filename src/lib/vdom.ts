import { Context } from './makeapp'

export type VNode = VNative | VEmpty | VText | VThunk<any, any>

type VNodeTypes = 'native' | 'empty' | 'text' | 'thunk'

interface AttributesJS {
  readonly [k: string]: any
  readonly key?: string | number
}

interface Attributes {
  readonly [k: string]: any
}

interface VNodeBase {
  readonly type: VNodeTypes
}

export interface VNative extends VNodeBase {
  readonly type: 'native'
  readonly tagName: keyof JSX.IntrinsicElements | undefined
  readonly attributes: Attributes
  readonly key: string | undefined
  readonly children: ReadonlyArray<VNode>
}
export function VNative(arg: Partial<VNative>): VNative {
  return {
    type: 'native',
    tagName: undefined,
    attributes: {},
    key: undefined,
    children: [],
    ...arg,
  }
}
export function isVNative(arg: any): arg is VNative {
  return arg && arg.type === 'native'
}

export interface VText extends VNodeBase {
  readonly type: 'text'
  readonly value: string | number | undefined
}
export function VText(arg: Partial<VText>): VText {
  return {
    type: 'text',
    value: undefined,
    ...arg,
  }
}
export function isVText(arg: any): arg is VText {
  return arg && arg.type === 'text'
}

interface ThunkProps<C extends Context<any>> extends Attributes {
  readonly onCreate?: (
    arg: { readonly props: Attributes; readonly ctx: C },
  ) => any
  readonly onDestroy?: (
    arg: { readonly props: Attributes; readonly ctx: C },
  ) => any
  readonly onUpdate?: (
    arg: { readonly props: Attributes; readonly ctx: C },
  ) => any
}

export interface VThunk<C extends Context<any>, Props extends ThunkProps<C>>
  extends VNodeBase {
  readonly type: 'thunk'
  readonly fn: (props: Props, context?: C) => VNode
  readonly props: Props
  readonly key: string | undefined
  readonly children: ReadonlyArray<VNode>
}
export function VThunk<Props>(
  arg: Partial<VThunk<any, any>>,
): VThunk<any, Props> {
  return {
    type: 'thunk',
    fn: () => {
      return VEmpty()
    },
    props: {},
    key: undefined,
    children: [],
    ...arg,
  }
}
export function isVThunk(arg: any): arg is VThunk<any, any> {
  return arg && arg.type === 'thunk'
}

export interface VEmpty extends VNodeBase {
  readonly type: 'empty'
}
export function VEmpty(): VEmpty {
  return {
    type: 'empty',
  }
}
export function isVEmpty(arg: any): arg is VEmpty {
  return arg && arg.type === 'empty'
}

type Children = VNode | number | string | null | ChildrenArray
interface ChildrenArray extends Array<Children> {}

export function h(
  tag: string | ((props: any) => VNode),
  attributesArg?: AttributesJS,
  ...childrenArray: Children[]
): VNode {
  const { key, ...attributes } = attributesArg
    ? attributesArg
    : { key: undefined }
  const children = childrenArray.reduce(reduceChildren, [])

  if (tag instanceof Function) {
    return VThunk({
      fn: tag,
      props: attributes,
      key: key ? String(key) : undefined,
      children,
    })
  }

  return VNative({
    tagName: tag as keyof JSX.IntrinsicElements,
    attributes,
    key: key ? String(key) : undefined,
    children,
  })
}

function reduceChildren(
  children: ReadonlyArray<VNode>,
  child: Children,
): VNode[] {
  if (typeof child === 'string' || typeof child === 'number') {
    return children.concat(
      VText({
        value: child,
      }),
    )
  } else if (child === null) {
    return children.concat(VEmpty())
  } else if (child instanceof Array) {
    return children.concat(child.reduce(reduceChildren, []))
  } else if (typeof child === 'undefined') {
    throw new Error(`VNode can't be undefined. Did you mean to use null?`)
  } else {
    return children.concat(child)
  }
}

export function createPath(...args: Array<string | number>): string {
  return args.join('.')
}

export interface GroupedNodes {
  // tslint:disable-next-line:readonly-keyword
  [key: string]: {
    readonly node: VNode
    readonly index: number
  }
}
export function groupByKey(children: ReadonlyArray<VNode>): GroupedNodes {
  return children
    .map((node, index) => ({
      node,
      index,
    }))
    .reduce(
      (mutableAcc, item) => {
        const key = isVNative(item.node)
          ? item.node.key
            ? item.node.key
            : item.index
          : item.index
        mutableAcc[key] = item
        return mutableAcc
      },
      {} as GroupedNodes,
    )
}
