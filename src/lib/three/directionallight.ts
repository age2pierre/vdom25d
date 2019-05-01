import {
  Color,
  DirectionalLight,
  Euler,
  Object3D,
  OrthographicCamera,
  Vector3,
} from 'three'
import { assertNever, entries } from '../utils'
import { defaultBaseProps, DirectionalLightProps } from './api'
import { ElementDriver, ThreeContext } from './driver'

const defaultProps: DirectionalLightProps = {
  ...defaultBaseProps,
  color: new Color(1, 1, 1),
  intensity: 0.8,
  target: new Vector3(),
  shadowProjector: new OrthographicCamera(-200, 200, 200, -200, 1, 100),
}

const driver: ElementDriver<
  DirectionalLight,
  DirectionalLightProps,
  ThreeContext,
  Object3D
> = {
  factory: (attr, ctx) => {
    const ref = new DirectionalLight()
    const fullAttr: DirectionalLightProps = {
      ...defaultProps,
      ...attr,
    }
    return entries(fullAttr).reduce((refAcc, { key, val }) => {
      return driver.update(refAcc, key, val)
    }, ref)
  },

  update: (mut_ref, key, newVal, oldVal) => {
    switch (key) {
      // keyable props
      case 'key':
        return mut_ref
      // three base props
      case 'position':
        mut_ref.position.set(
          (newVal as Vector3).x,
          (newVal as Vector3).y,
          (newVal as Vector3).z,
        )
        // TODO look at !! needs passing all the props !!
        return mut_ref
      case 'rotation':
        mut_ref.rotation.set(
          (newVal as Euler).x,
          (newVal as Euler).y,
          (newVal as Euler).z,
        )
        return mut_ref
      case 'scale':
        mut_ref.scale.set(
          (newVal as Vector3).x,
          (newVal as Vector3).y,
          (newVal as Vector3).z,
        )
        return mut_ref
      case 'receiveShadow':
        mut_ref.receiveShadow = !!newVal
        return mut_ref
      case 'castShadow':
        mut_ref.castShadow = !!newVal
        return mut_ref
      case 'visible':
        mut_ref.visible = !!newVal
        return mut_ref
      // light base props
      case 'color':
        mut_ref.color = newVal as Color
        return mut_ref
      case 'intensity':
        mut_ref.intensity = newVal as number
        return mut_ref
      // dir light props
      case 'target':
        mut_ref.lookAt(newVal as Vector3)
        return mut_ref
      case 'shadowProjector':
        const cam = newVal as OrthographicCamera
        mut_ref.shadowCameraBottom = cam.bottom
        mut_ref.shadowCameraFar = cam.far
        mut_ref.shadowCameraLeft = cam.left
        mut_ref.shadowCameraRight = cam.right
        mut_ref.shadowCameraTop = cam.top
        mut_ref.shadowCameraNear = cam.near
        return mut_ref
      default:
        throw assertNever(key)
    }
  },
}

export default driver
