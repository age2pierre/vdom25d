import { Map } from 'immutable'
import diffNode, {
  diffAttributes,
  IndexedActions,
  InsertNode,
  RemoveNode,
  ReplaceNode,
  SameNode,
  SetAttribute,
  UpdateChildren,
} from './diffnode'
import { h, VEmpty, VNative } from './vdom'

describe('diffAttributes', () => {
  const node1 = <box x={1} y={2} /> as VNative
  const node2 = <box x={2} y={2} /> as VNative

  test('replace one attribute', () => {
    const actions = diffAttributes(node1, node2)
    expect(actions).toEqual([new SetAttribute('x', 2)])
  })
})

describe('diffNode', () => {
  const node1 = (
    <group>
      <box key="child1" x={1} y={2} />
    </group>
  )
  const node2 = <group />
  const node3 = (
    <group>
      <box key="child1" x={1} y={2} />
      <box key="child2" x={0} y={0} />
    </group>
  )
  const node4 = (
    <group>
      <box key="child1" x={1} y={2}>
        <box key="child11" x={0} y={0} />
      </box>
      <box key="child2" x={0} y={0} />
    </group>
  )
  const node5 = <box x={1} y={2} />
  const node6 = (
    <group>
      <box x={1} y={2} />
    </group>
  )
  const node7 = <group>{null}</group>

  test('same node', () => {
    const changes = diffNode(node1, node1, '0')
    expect(changes).toEqual([new SameNode()])
  })

  test('remove child', () => {
    const changes1 = diffNode(node1, node2, '0')
    const changes2 = diffNode(node3, node1, '0')
    const changes3 = diffNode(node4, node3, '0')
    expect(changes1).toEqual([
      new UpdateChildren(
        (Map() as IndexedActions).set(0, [
          new RemoveNode(<box key="child1" x={1} y={2} />),
        ]),
      ),
    ])
    expect(changes2).toEqual([
      new UpdateChildren(
        (Map() as IndexedActions).set(1, [
          new RemoveNode(<box key="child2" x={0} y={0} />),
        ]),
      ),
    ])
    expect(changes3).toEqual([
      new UpdateChildren(
        (Map() as IndexedActions).set(0, [
          new UpdateChildren(
            (Map() as IndexedActions).set(0, [
              new RemoveNode(<box key="child11" x={0} y={0} />),
            ]),
          ),
        ]),
      ),
    ])
  })

  test('insert child', () => {
    const changes1 = diffNode(node2, node1, '0')
    const changes2 = diffNode(node1, node3, '0')
    const changes3 = diffNode(node3, node4, '0')

    expect(changes1).toEqual([
      new UpdateChildren(
        (Map() as IndexedActions).set(0, [
          new InsertNode(<box key="child1" x={1} y={2} />, '0.child1'),
        ]),
      ),
    ])
    expect(changes2).toEqual([
      new UpdateChildren(
        (Map() as IndexedActions).set(1, [
          new InsertNode(<box key="child2" x={0} y={0} />, '0.child2'),
        ]),
      ),
    ])
    expect(changes3).toEqual([
      new UpdateChildren(
        (Map() as IndexedActions).set(0, [
          new UpdateChildren(
            (Map() as IndexedActions).set(0, [
              new InsertNode(
                <box key="child11" x={0} y={0} />,
                '0.child1.child11',
              ),
            ]),
          ),
        ]),
      ),
    ])
  })

  test('replace node', () => {
    const actions1 = diffNode(node2, node5, '0')
    const actions2 = diffNode(node6, node7, '0')

    expect(actions1).toEqual([new ReplaceNode(node2, node5, '0')])
    expect(actions2).toEqual([
      new UpdateChildren(
        (Map() as IndexedActions).set(0, [
          new ReplaceNode(<box x={1} y={2} />, new VEmpty(), '0.0'),
        ]),
      ),
    ])
  })
})
