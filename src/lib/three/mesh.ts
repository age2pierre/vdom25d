import {
  BoxGeometry,
  Color,
  Euler,
  Geometry,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three'
import { assertNever, entries } from '../utils'
import { defaultBaseProps, GroupProps, MeshProps } from './api'
import { ElementDriver, ThreeContext } from './driver'

const defaultProps: MeshProps = {
  ...defaultBaseProps,
  geometry: new BoxGeometry(1, 1, 1),
  material: new MeshStandardMaterial({
    color: new Color(1, 0.2, 0.2),
    metalness: 0,
    roughness: 1,
  }),
}

const driver: ElementDriver<Mesh, MeshProps, ThreeContext, Object3D> = {
  factory: attr => {
    const ref = new Mesh()
    const fullAttr: GroupProps = {
      ...defaultProps,
      ...attr,
    }
    return entries(fullAttr).reduce((refAcc, { key, val }) => {
      return driver.update(refAcc, key, val)
    }, ref)
  },

  update: (mut_ref, key, newVal) => {
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
      // mesh props
      case 'geometry':
        mut_ref.geometry = newVal as Geometry
        return mut_ref
      case 'material':
        mut_ref.material = newVal as Material
        return mut_ref
      default:
        throw assertNever(key)
    }
  },
}

export default driver
