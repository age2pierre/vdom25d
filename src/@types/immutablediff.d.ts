declare module 'immutable-diff' {
  import { List, Map, Set } from 'immutable'

  interface ImmutableMap<T> extends Map<string, any> {
    get<K extends keyof T>(name: K): T[K]
  }

  export default function diff(
    a: Map<any, any> | List<any> | Set<any>,
    b: Map<any, any> | List<any> | Set<any>,
  ): List<
    ImmutableMap<{
      op: 'add' | 'remove' | 'replace'
      path: List<any>
      value: any
    }>
  >
}
