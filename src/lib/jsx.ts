import { GridCoord } from './driver'
import { VNode } from './vdom'

interface NodeData {
  key?: string
}

declare global {
  namespace JSX {
    type Element = VNode

    interface IntrinsicElements {
      // for test purposes only
      box: GridCoord & NodeData
      group: NodeData

      // previosionnal api
      stage: NodeData
      entity: NodeData
      mesh: NodeData
      sensor: NodeData
    }
  }
}
