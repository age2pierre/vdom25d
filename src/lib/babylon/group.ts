import { Node, Quaternion, TransformNode, Vector3 } from 'babylonjs'
import { assertNever, entries } from '../utils'
import { GroupProps } from './api'
import { BabylonContext, ElementDriver } from './driver'

const box: ElementDriver<TransformNode, GroupProps, BabylonContext, Node> = {
  factory: (props, context) => {
    const group = new TransformNode('group', context.scene)
    entries(props).forEach(({ key, val }) => {
      box.update(group, key, val, undefined, context)
    })
    return group
  },

  update: (ref, key, newVal, oldVal, ctx) => {
    const mutableRef = ref
    switch (key) {
      case 'key':
        return ref
      case 'rotation':
        mutableRef.rotation = newVal as Vector3
        return mutableRef
      case 'rotationQuaternion':
        mutableRef.rotationQuaternion = newVal as Quaternion
        return mutableRef
      case 'position':
        mutableRef.position = newVal as Vector3
        return mutableRef
      default:
        throw assertNever(key)
    }
  },
}

export default box
