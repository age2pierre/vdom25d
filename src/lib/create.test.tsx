import { Group, Mesh, Points, Scene, Vector3 } from 'three'
import { createElement } from './create'
import createThreeContext, { ThreeContext } from './three/driver'
import NullRenderer from './three/nullRenderer'
import { range } from './utils'
import { h, VEmpty, VText } from './vdom'

describe('three element creation', () => {
  let context: ThreeContext
  const renderer = new NullRenderer()

  const Thunk = (props: { readonly numchild: number }) => (
    <group position={new Vector3(1, 1, 0)}>
      {range(1, props.numchild + 1).map(i => (
        <mesh key={`child${i}`} position={new Vector3(i, i, 0)} />
      ))}
    </group>
  )

  beforeEach(() => {
    context = createThreeContext(renderer)
    expect(context.refRoot.children).toHaveLength(0)
    expect(context.refRoot).toBeInstanceOf(Points)
    expect(context.scene).toBeInstanceOf(Scene)
    expect(context.scene.children).toHaveLength(1)
    expect(context.scene.children[0]).toBe(context.refRoot)
  })

  test('native element', () => {
    const node = <group position={new Vector3(1, 1, 0)} />
    const el = createElement(node, '0', context)
    expect(el).toBeInstanceOf(Group)
  })

  test('text element', () => {
    const node = VText({
      value: 'This are not the droid ur looking for',
    })
    expect(() => createElement(node, '0', context)).toThrow()
  })

  test('empty element', () => {
    const node = VEmpty()
    const el = createElement(node, '0', context)
    expect(el).toBeInstanceOf(Points)
    expect(el.userData.path).toBe('0')
  })

  test('thunk with no child', () => {
    const node = <Thunk numchild={0} />
    const el = createElement(node, '0', context)

    expect(el).toBeInstanceOf(Group)
    expect(el.children).toHaveLength(0)
    expect(el.position).toEqual(new Vector3(1, 1))
  })

  test('thunk with children', () => {
    const node = <Thunk numchild={2} />
    const el = createElement(node, '0', context)

    expect(el).toBeInstanceOf(Group)
    expect((el as Mesh).children).toHaveLength(2)
    expect((el as Mesh).children[0]).toBeInstanceOf(Mesh)
    expect(((el as Mesh).children[0] as Mesh).position).toEqual(
      new Vector3(1, 1),
    )
    expect((el as Mesh).children[1]).toBeInstanceOf(Mesh)
    expect(((el as Mesh).children[1] as Mesh).position).toEqual(
      new Vector3(2, 2),
    )
  })
})
