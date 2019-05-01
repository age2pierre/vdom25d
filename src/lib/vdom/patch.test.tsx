import { Group, Mesh, Points, Scene, Vector3 } from 'three'
import createThreeContext, { ThreeContext } from '../three/driver'
import NullRenderer from '../three/nullRenderer'
import { range } from '../utils'
import { h, VNative, VThunk } from '../vdom/vdom'
import {
  DiffActions,
  InsertNode,
  RemoveNode,
  ReplaceNode,
  SameNode,
  SetAttribute,
  UpdateChildren,
  UpdateThunk,
} from './diffnode'
import patch from './patch'

describe('three element patching', () => {
  let ctx: ThreeContext
  const renderer = new NullRenderer()

  const wrapUpdateChild = (op: DiffActions, index = 0): UpdateChildren => ({
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

  test('set attribute', () => {
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

  test('insert node', () => {
    const el = new Group()

    expect(el.children).toHaveLength(0)

    const op: InsertNode = {
      action: 'insert_node',
      nextPath: '0.child1',
      child: VNative({
        tagName: 'mesh',
        type: 'native',
        attributes: {
          position: new Vector3(1, 2),
        },
      }),
    }
    const wrappedOp: UpdateChildren = wrapUpdateChild(op)
    const patchedEl = patch(ctx)(el, wrappedOp)

    expect(patchedEl.children).toHaveLength(1)
    expect(patchedEl.children[0]).toBeInstanceOf(Mesh)
    expect(patchedEl.children[0].position).toEqual(new Vector3(1, 2))
  })

  test('remove node, first and only child', () => {
    const el = new Group()
    const elChild = new Mesh()
    el.add(elChild)

    expect(el.children).toHaveLength(1)
    expect(el.children[0]).toBe(elChild)

    const op: RemoveNode = {
      action: 'remove_node',
      prevNode: <mesh />,
    }
    const wrappedOp: UpdateChildren = wrapUpdateChild(op)
    const patchedEl = patch(ctx)(el, wrappedOp)

    expect(patchedEl.children).toHaveLength(0)
  })

  test('remove node, second child', () => {
    const el = new Group()
    const elChild1 = new Mesh()
    const elChild2 = new Mesh()
    el.add(elChild1)
    el.add(elChild2)

    expect(el.children).toHaveLength(2)
    expect(el.children[0]).toBe(elChild1)
    expect(el.children[1]).toBe(elChild2)

    const op: RemoveNode = {
      action: 'remove_node',
      prevNode: <mesh />,
    }
    const wrappedOp: UpdateChildren = wrapUpdateChild(op, 1)
    const patchedEl = patch(ctx)(el, wrappedOp)

    expect(patchedEl.children).toHaveLength(1)
    expect(patchedEl.children[0]).toBe(elChild1)
  })

  test('remove node, two level deep', () => {
    const el = new Group()
    const elChild = new Mesh()
    const elChild2 = new Mesh()
    elChild.add(elChild2)
    el.add(elChild)

    expect(el.children[0]).toBe(elChild)
    expect(el.children[0].children[0]).toBe(elChild2)

    const op: RemoveNode = {
      action: 'remove_node',
      prevNode: <mesh />,
    }
    const wrappedOp: UpdateChildren = wrapUpdateChild(wrapUpdateChild(op))
    const patchedEl = patch(ctx)(el, wrappedOp)

    expect(patchedEl.children[0]).toBe(elChild)
    expect(patchedEl.children[0].children).toHaveLength(0)
  })

  test('replace node', () => {
    const el = new Group()

    const op: ReplaceNode = {
      action: 'replace_node',
      prevNode: <group />,
      nextNode: <mesh />,
      path: '0',
    }

    const patchedEl = patch(ctx)(el, op)
    expect(patchedEl).toBeInstanceOf(Mesh)
  })

  test('update thunk', () => {
    interface ThunkProps {
      readonly numchild: number
    }

    const Thunk = (props: ThunkProps) => (
      <group>
        {range(1, props.numchild + 1).map(i => (
          <mesh key={`child${i}`} position={new Vector3(i, i, 0)} />
        ))}
      </group>
    )

    const el = new Group()
    const mut_Child1 = new Mesh()
    el.add(mut_Child1)

    const op: UpdateThunk = {
      action: 'update_thunk',
      prevNode: <Thunk numchild={1} /> as VThunk<any, ThunkProps>,
      nextNode: <Thunk numchild={2} /> as VThunk<any, ThunkProps>,
      path: '0',
    }

    const patchedEl = patch(ctx)(el, op)
    expect(patchedEl.children).toHaveLength(2)
  })
})
