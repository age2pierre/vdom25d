import { GridCoord } from './driver'
import { VNode } from './vdom'

interface NodeData {
  readonly key?: string
}

declare global {
  namespace JSX {
    type Element = VNode

    interface IntrinsicElements {
      // for test purposes only
      readonly box: GridCoord & NodeData
      readonly group: NodeData

      // previosionnal api
      readonly stage: NodeData
      readonly entity: NodeData
      readonly mesh: NodeData
      readonly sensor: NodeData
    }
  }
}
