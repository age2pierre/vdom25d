import { Mesh, NullEngine, Vector3 } from 'babylonjs'
import createBabylonContext, { BabylonContext } from './babylon/driver'
import { createElement } from './create'
import { range } from './utils'
import { h } from './vdom'

describe('babylon element creation', () => {
  let context: BabylonContext
  const engine = new NullEngine()
  const Thunk = (props: { readonly numchild: number }) => (
    <box position={new Vector3(0, 0, 0)}>
      {range(1, props.numchild + 1).map(i => (
        <box key={`child${i}`} position={new Vector3(i, i, 0)} />
      ))}
    </box>
  )

  beforeEach(() => {
    context = createBabylonContext(engine)
  })

  test('no child', () => {
    const node = <Thunk numchild={0} />
    const el = createElement(node, '0', context)

    expect(el).toBeInstanceOf(Mesh)
    expect((el as Mesh).getChildren()).toHaveLength(0)

    expect(context.scene.rootNodes).toHaveLength(2)
    expect(context.scene.rootNodes[1]).toEqual(el)
    expect((context.scene.rootNodes[1] as Mesh).position).toEqual(
      new Vector3(0, 0),
    )
  })

  test('with children', () => {
    const node = <Thunk numchild={2} />
    const el = createElement(node, '0', context)

    expect(el instanceof Mesh).toBe(true)
    expect((el as Mesh).getChildren()).toHaveLength(2)
    expect((el as Mesh).getChildren()[0]).toBeInstanceOf(Mesh)
    expect(((el as Mesh).getChildren()[0] as Mesh).position).toEqual(
      new Vector3(1, 1),
    )
    expect((el as Mesh).getChildren()[1]).toBeInstanceOf(Mesh)
    expect(((el as Mesh).getChildren()[1] as Mesh).position).toEqual(
      new Vector3(2, 2),
    )

    expect(context.scene.rootNodes).toHaveLength(2)
    expect(context.scene.rootNodes[1]).toEqual(el)
  })
})
