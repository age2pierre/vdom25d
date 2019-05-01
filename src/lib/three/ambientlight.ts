import { AmbientLight, Color, Euler, Object3D, Vector3 } from 'three'
import { assertNever, entries } from '../utils'
import { AmbientLightProps, defaultBaseProps } from './api'
import { ElementDriver, ThreeContext } from './driver'

const defaultProps: AmbientLightProps = {
  ...defaultBaseProps,
  color: new Color(1, 1, 1),
  intensity: 0.8,
}

const driver: ElementDriver<
  AmbientLight,
  AmbientLightProps,
  ThreeContext,
  Object3D
> = {
  factory: (attr, ctx) => {
    const ref = new AmbientLight()
    const fullAttr: AmbientLightProps = {
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
      default:
        throw assertNever(key)
    }
  },
}

export default driver
