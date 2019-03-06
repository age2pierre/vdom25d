import { BoxProps, GroupProps } from './babylon/api'
import { VNode } from './vdom'

export interface Keyable {
  readonly key?: string
}

declare global {
  namespace JSX {
    type Element = VNode

    interface IntrinsicElements {
      readonly box: Partial<BoxProps>
      readonly group: Partial<GroupProps>
      // readonly sphere: Partial<SphereProps>
      // readonly mesh: Partial<MeshProps>
      // readonly skinnedMesh: Partial<SkinnedMeshProps>
      // readonly camera: Partial<CameraProps>
      // readonly light: Partial<LightProps>
      // readonly sprite: Partial<SpriteProps>
    }
  }
}
