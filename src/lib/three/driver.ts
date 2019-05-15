/* tslint:disable:no-object-mutation */
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  Group,
  Mesh,
  Object3D,
  Points,
  Renderer,
  Scene,
} from 'three'
import { Context } from '../makeapp'
import { assertNever } from '../utils'
import { createElement } from '../vdom/create'
import { createPath, VEmpty, VNative } from '../vdom/vdom'
import ambientLight from './ambientlight'
import directionalLight from './directionallight'
import group from './group'
import mesh from './mesh'

export interface ThreeContext extends Context<Object3D> {
  readonly renderer: Renderer
  readonly scene: Scene
}

export interface ElementDriver<Ref extends T, Props, C extends Context<T>, T> {
  readonly factory: (attr: Partial<Props>, ctx: C) => Ref
  readonly update: (
    ref: Ref,
    key: keyof Props,
    newVal: Props[keyof Props],
    oldAttr?: Props,
    ctx?: C,
  ) => Ref
}

function createThreeElement(
  vnode: VNative,
  path: string,
  context: ThreeContext,
): Object3D {
  const { tagName, attributes, children } = vnode
  let el: Object3D
  switch (tagName) {
    case 'group':
      el = group.factory(attributes, context)
      break
    case 'mesh':
      el = mesh.factory(attributes, context)
      break
    case 'ambientLight':
      el = ambientLight.factory(attributes, context)
      break
    case 'directionalLight':
      el = directionalLight.factory(attributes, context)
      break
    case undefined:
    case 'tag':
      throw Error("Tagname shouldn't be undefined")
    default:
      throw assertNever(tagName)
  }
  children.forEach((node, index) => {
    const key = node.type === 'native' ? node.key : false
    const childPath = createPath(path, key || index)
    const child = createElement(node, childPath, context)
    el.add(child)
  })
  return el
}

export default function createThreeContext(
  renderer: Renderer,
  background: Color = new Color(0xa0a0a0),
  fog?: Fog,
): ThreeContext {
  const scene = new Scene()
  scene.background = background
  if (fog) {
    scene.fog = fog
  }
  const refRoot = new Points()
  refRoot.userData = {
    path: '0',
  }
  scene.add(refRoot)
  const context: ThreeContext = {
    renderer,
    scene,
    refRoot,
    root: VEmpty(),
    emptyFactory: path => {
      const ref = new Points()
      ref.userData = {
        path,
      }
      return ref
    },
    dispatch: e => {
      // tslint:disable-next-line:no-console
      console.warn('Dispatch not yet implemented ' + JSON.stringify(e))
    },
    createNativeEl: (vnode, path) => createThreeElement(vnode, path, context),
    getChildren: node => node.children,
    getParent: node => node.parent || scene,
    replaceChild: (parent, oldRef, newRef) => {
      return (
        context.removeChild(parent, oldRef) &&
        context.insertAtIndex(parent, 0, newRef)
      )
    },
    removeChild: (parent, oldRef) => {
      return parent.remove(oldRef)
    },
    insertAtIndex: (parent, _index, ref) => {
      return parent.add(ref)
    },
    updateAttribute: (ref, key, tag, newVal, oldAttr) => {
      if (!tag) {
        throw new Error(
          'updateAttribute on VText is not implemented yet in Babylon driver',
        )
      } else {
        switch (tag) {
          case 'group':
            return group.update(ref as Group, key as any, newVal)
          case 'mesh':
            return mesh.update(ref as Mesh, key as any, newVal)
          case 'ambientLight':
            return ambientLight.update(ref as AmbientLight, key as any, newVal)
          case 'directionalLight':
            return directionalLight.update(
              ref as DirectionalLight,
              key as any,
              newVal,
              oldAttr,
            )
          case undefined:
          case 'tag':
            throw Error("Tagname shouldn't be undefined")
          default:
            throw assertNever(tag)
        }
      }
    },
  }
  return context
}
