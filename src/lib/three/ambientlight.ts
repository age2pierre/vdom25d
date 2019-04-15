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

  update: (mutableRef, key, newVal, oldVal) => {
    switch (key) {
      // keyable props
      case 'key':
        return mutableRef
      // three base props
      case 'position':
        mutableRef.position.set(
          (newVal as Vector3).x,
          (newVal as Vector3).y,
          (newVal as Vector3).z,
        )
        return mutableRef
      case 'rotation':
        mutableRef.rotation.set(
          (newVal as Euler).x,
          (newVal as Euler).y,
          (newVal as Euler).z,
        )
        return mutableRef
      case 'scale':
        mutableRef.scale.set(
          (newVal as Vector3).x,
          (newVal as Vector3).y,
          (newVal as Vector3).z,
        )
        return mutableRef
      case 'receiveShadow':
        mutableRef.receiveShadow = !!newVal
        return mutableRef
      case 'castShadow':
        mutableRef.castShadow = !!newVal
        return mutableRef
      case 'visible':
        mutableRef.visible = !!newVal
        return mutableRef
      // mesh props
      case 'color':
        mutableRef.color = newVal as Color
        return mutableRef
      case 'intensity':
        mutableRef.intensity = newVal as number
        return mutableRef
      default:
        throw assertNever(key)
    }
  },
}

export default driver
