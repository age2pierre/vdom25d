import { GridCoord } from './driver'
import { VNode } from './vdom'

interface NodeData {
  key?: string
}

declare global {
  namespace JSX {
    type Element = VNode

    interface IntrinsicElements {
      box: GridCoord & NodeData
      group: NodeData
    }
  }
}
