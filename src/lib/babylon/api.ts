import { ActionEvent, Material, Quaternion, Vector3 } from 'babylonjs'
import { Keyable } from '../jsx'
import { Context } from '../makeapp'

export interface Positionable {
  readonly position: Vector3
  readonly rotation: Vector3
  readonly rotationQuaternion: Quaternion
  // readonly setPivotMatrix: Vector3,
}

export interface Scalable {
  readonly scale: Vector3
}

export interface Assetable {
  readonly src: string
}

export interface Materializable {
  readonly material: Material
}

export type Eventcallback<P, C extends Context<any>> = (
  arg: { readonly props: P; readonly ctx: C; readonly evt: ActionEvent },
) => void

export interface Eventable<P, C extends Context<any>> {
  readonly onCenterPick: Eventcallback<P, C>
  readonly onDoublePick: Eventcallback<P, C>
  readonly onEveryFrame: Eventcallback<P, C>
  readonly onIntersectionEnter: Eventcallback<P, C>
  readonly onIntersectionExit: Eventcallback<P, C>
  readonly onKeyDown: Eventcallback<P, C>
  readonly onKeyUp: Eventcallback<P, C>
  readonly onLeftPick: Eventcallback<P, C>
  readonly onLongPress: Eventcallback<P, C>
  readonly onPickDown: Eventcallback<P, C>
  readonly onPickOut: Eventcallback<P, C>
  readonly onPick: Eventcallback<P, C>
  readonly onPickUp: Eventcallback<P, C>
  readonly onPointerOutv: Eventcallback<P, C>
  readonly onPointerOver: Eventcallback<P, C>
  readonly onRightPick: Eventcallback<P, C>
}

export interface GroupProps extends Keyable, Positionable {}
export interface BoxProps
  extends Positionable,
    Keyable,
    Materializable,
    Scalable {}
export interface MeshProps
  extends Keyable,
    Positionable,
    Scalable,
    Assetable,
    Eventable<MeshProps, Context<any>> {}
export interface SkinnedMeshProps
  extends Keyable,
    Positionable,
    Scalable,
    Assetable,
    Eventable<MeshProps, Context<any>> {}
export interface CameraProps extends Keyable, Positionable {
  readonly fov: number
}
export interface LightProps extends Keyable, Positionable {}
export interface SpriteProps extends Keyable, Positionable {}
export interface SphereProps extends Positionable, Keyable, Materializable {}
