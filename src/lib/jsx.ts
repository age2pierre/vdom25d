import { Quaternion, Vector3 } from 'babylonjs'
import { GridCoord } from './makeapp'
import { VNode } from './vdom'

interface NodeData {
  readonly key?: string
}

interface MeshData {
  readonly position: Vector3
  readonly rotation: Vector3
  readonly rotationQuaternion: Quaternion
  // readonly setPivotMatrix: Vector3,
  readonly scaling: Vector3
}

declare global {
  namespace JSX {
    type Element = VNode

    interface IntrinsicElements {
      // for test purposes only
      readonly box: GridCoord & NodeData
      readonly group: NodeData

      // previosionnal api
      readonly mesh: NodeData & MeshData
      readonly skinnedMesh: NodeData & MeshData
    }
  }
}
