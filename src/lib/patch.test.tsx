import { Group, Points, Scene, Vector3 } from 'three'
import { DiffActions, InsertNode, SameNode, SetAttribute } from './diffnode'
import patch from './patch'
import createThreeContext, { ThreeContext } from './three/driver'
import NullRenderer from './three/nullRenderer'
import { VNative } from './vdom'

describe('three element patching', () => {
  let ctx: ThreeContext
  const renderer = new NullRenderer()

  const wrapUpdateChild = (op: DiffActions, index = 0) => ({
    action: 'update_chilren',
    indexedActions: { [index]: [op] },
  })

  beforeEach(() => {
    ctx = createThreeContext(renderer)
    expect(ctx.refRoot.children).toHaveLength(0)
    expect(ctx.refRoot).toBeInstanceOf(Points)
    expect(ctx.scene).toBeInstanceOf(Scene)
    expect(ctx.scene.children).toHaveLength(1)
    expect(ctx.scene.children[0]).toBe(ctx.refRoot)
  })

  test('same node', () => {
    const op: SameNode = {
      action: 'same_node',
    }
    const patchedEl = patch(ctx)(ctx.refRoot, op)
    expect(patchedEl).toBe(ctx.refRoot)
  })

  test('set_attribute', () => {
    const el = new Group()
    expect(el.position).toEqual(new Vector3(0, 0, 0))

    const nextValue = new Vector3(1, 1, 1)
    const op: SetAttribute = {
      action: 'set_attribute',
      key: 'position',
      nextValue,
      tag: 'group',
    }
    const patchedEl = patch(ctx)(el, op)
    expect(patchedEl.position).toEqual(nextValue)
    expect(patchedEl).toBe(el)
  })

  test('insert_node', () => {
    const el = new Group()
    expect(el.children).toHaveLength(0)

    const op: InsertNode = {
      action: 'insert_node',
      nextPath: '0.0',
      child: VNative({
        tagName: 'mesh',
        type: 'native',
      }),
    }
    const patchedEl = patch(ctx)(el, wrapUpdateChild(op))
    expect(patchedEl.children).toHaveLength(1)
  })
})
