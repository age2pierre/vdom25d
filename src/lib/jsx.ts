import { AmbientLightProps, GroupProps, MeshProps } from './three/api'
import { VNode } from './vdom'

export interface Keyable {
  readonly key?: string
}

declare global {
  namespace JSX {
    type Element = VNode

    interface IntrinsicElements {
      // for test purpose only
      readonly tag: any

      readonly group: Partial<GroupProps>
      readonly mesh: Partial<MeshProps>
      // readonly gltf: Partial<GLTFProps>
      // readonly animatedGltf: Partial<AnimatedGLTFProps>
      readonly ambientLight: Partial<AmbientLightProps>
      // readonly directionalLight: Partial<DirectionalLightProps>
      // readonly hemispĥereLight: Partial<HemisphereLight>
      // readonly pointLight: Partial<PointLightProps>
      // readonly spotLight: Partial<SpotLightProps>
      // readonly camera: Partial<CameraProps>
      // readonly sprite: Partial<SpriteProps>
    }
  }
}
