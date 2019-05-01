import {
  Color,
  Euler,
  Geometry,
  Material,
  OrthographicCamera,
  PerspectiveCamera,
  Vector3,
} from 'three'
import { Keyable } from '../jsx'

interface ThreeBaseProps {
  readonly position: Vector3
  readonly rotation: Euler
  // readonly quaternion: Quaternion
  readonly scale: Vector3
  readonly receiveShadow: boolean
  readonly castShadow: boolean
  readonly visible: boolean
}

export const defaultBaseProps: ThreeBaseProps = {
  position: new Vector3(),
  rotation: new Euler(),
  scale: new Vector3(1, 1, 1),
  receiveShadow: true,
  castShadow: true,
  visible: true,
}

export interface GroupProps extends ThreeBaseProps, Keyable {}

export interface MeshProps extends ThreeBaseProps, Keyable {
  readonly geometry: Geometry
  readonly material: Material
}

export interface AnimatedGLTFProps extends ThreeBaseProps, Keyable {
  readonly url: string
  readonly mixerWeights: {
    readonly [actionName: string]: number
  }
}

export interface GLTFProps extends ThreeBaseProps, Keyable {
  readonly url: string
}

interface LightBaseProps extends ThreeBaseProps, Keyable {
  readonly color: Color
  readonly intensity: number
}

export const defaultLightProps: LightBaseProps = {
  ...defaultBaseProps,
  color: new Color(1, 1, 1),
  intensity: 0.7,
}

// tslint:disable-next-line: no-empty-interface
export interface AmbientLightProps extends LightBaseProps {}

export interface DirectionalLightProps extends LightBaseProps {
  readonly target: Vector3 // TODO convert it to Object3D with Vector3 position in worldspace
  readonly shadowProjector: OrthographicCamera // correspond to props DirectionalLightShadow.camera
}

export interface HemisphereLightProps extends LightBaseProps {
  readonly groundColor: Color
  readonly skyColor: Color
}

export interface PointLightProps extends LightBaseProps {
  readonly decay: number
  readonly distance: number
  readonly power: number
  readonly shadowProjector: PerspectiveCamera // correspond to props PointLightShadow.camera
}

export interface SpotLightProps extends LightBaseProps {
  readonly angle: number
  readonly decay: number
  readonly distance: number
  readonly power: number
  readonly exponent: number
  readonly penumbra: number
  readonly target: Vector3 // TODO convert it to Object3D with Vector3 position in worldspace
  readonly shadowProjector: PerspectiveCamera // correspond to props SpotLightShadow.camera
}
