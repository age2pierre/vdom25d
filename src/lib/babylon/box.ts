import { Material, Mesh, Node, Quaternion, Vector3 } from 'babylonjs'
import { assertNever, entries } from '../utils'
import { BoxProps } from './api'
import { BabylonContext, ElementDriver } from './driver'

const box: ElementDriver<Mesh, BoxProps, BabylonContext, Node> = {
  factory: (props, context) => {
    const mutableBox = Mesh.CreateBox('box', 1, context.scene)
    mutableBox.isPickable = false
    entries(props).forEach(({ key, val }) => {
      box.update(mutableBox, key, val, undefined, context)
    })
    return mutableBox
  },

  update: (ref, key, newVal) => {
    const mutableRef = ref
    switch (key) {
      case 'key':
        return ref
      case 'material':
        mutableRef.material = newVal as Material
        return mutableRef
      case 'rotation':
        mutableRef.rotation = newVal as Vector3
        return mutableRef
      case 'rotationQuaternion':
        mutableRef.rotationQuaternion = newVal as Quaternion
        return mutableRef
      case 'position':
        mutableRef.position = newVal as Vector3
        return mutableRef
      case 'scale':
        mutableRef.scaling = newVal as Vector3
        return mutableRef
      default:
        throw assertNever(key)
    }
  },
}

export default box
