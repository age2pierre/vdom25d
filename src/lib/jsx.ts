import { GridCoord } from './driver'
import { VNode } from './vdom'

declare global {
  namespace JSX {
    type Element = VNode

    interface IntrinsicElements {
      box: GridCoord
      group: {}
    }
  }
}
