import { Vector3 } from 'babylonjs'
import diffNode, {
  diffAttributes,
  InsertNode,
  RemoveNode,
  ReplaceNode,
  SameNode,
  SetAttribute,
  UpdateChildren,
} from './diffnode'
import { h, VEmpty, VNative } from './vdom'

const vec0 = new Vector3(0, 0)
const vec1 = new Vector3(1, 2)
const vec2 = new Vector3(2, 2)

describe('diffAttributes', () => {
  const node1 = <box position={vec1} /> as VNative
  const node2 = <box position={vec2} /> as VNative

  test('replace one attribute', () => {
    const actions = diffAttributes(node1, node2)
    const expected: SetAttribute = {
      action: 'set_attribute',
      tag: 'box',
      key: 'position',
      nextValue: vec2,
      prevValue: vec1,
    }
    expect(actions).toEqual([expected])
  })
})

describe('diffNode', () => {
  const node1 = (
    <group>
      <box key="child1" position={vec1} />
    </group>
  )
  const node2 = <group />
  const node3 = (
    <group>
      <box key="child1" position={vec1} />
      <box key="child2" position={vec0} />
    </group>
  )
  const node4 = (
    <group>
      <box key="child1" position={vec1}>
        <box key="child11" position={vec0} />
      </box>
      <box key="child2" position={vec0} />
    </group>
  )
  const node5 = <box position={vec1} />
  const node6 = (
    <group>
      <box position={vec1} />
    </group>
  )
  const node7 = <group>{null}</group>

  test('same node', () => {
    const changes = diffNode(node1, node1, '0')
    const expected: SameNode = {
      action: 'same_node',
    }
    expect(changes).toEqual([expected])
  })

  test('remove first and only child', () => {
    const changes = diffNode(node1, node2, '0')
    const expectedNested: RemoveNode = {
      action: 'remove_node',
      prevNode: <box key="child1" position={vec1} />,
    }
    const expected: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: {
        0: [expectedNested],
      },
    }
    expect(changes).toEqual([expected])
  })

  test('remove second child', () => {
    const changes = diffNode(node3, node1, '0')
    const expectedNested: RemoveNode = {
      action: 'remove_node',
      prevNode: <box key="child2" position={vec0} />,
    }
    const expected: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: {
        1: [expectedNested],
      },
    }
    expect(changes).toEqual([expected])
  })

  test('remove two level deep child', () => {
    const changes = diffNode(node4, node3, '0')
    const expected3action2: RemoveNode = {
      action: 'remove_node',
      prevNode: <box key="child11" position={vec0} />,
    }
    const expected3action1: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: {
        0: [expected3action2],
      },
    }
    const expected3: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: {
        0: [expected3action1],
      },
    }
    expect(changes).toEqual([expected3])
  })

  test('insert one child', () => {
    const changes = diffNode(node2, node1, '0')
    const expectedNested: InsertNode = {
      action: 'insert_node',
      child: <box key="child1" position={vec1} />,
      nextPath: '0.child1',
    }
    const expected: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: { 0: [expectedNested] },
    }
    expect(changes).toEqual([expected])
  })

  test('insert one child with one existing child', () => {
    const changes = diffNode(node1, node3, '0')
    const expectedNested: InsertNode = {
      action: 'insert_node',
      child: <box key="child2" position={vec0} />,
      nextPath: '0.child2',
    }
    const expected: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: {
        1: [expectedNested],
      },
    }
    expect(changes).toEqual([expected])
  })

  test('insert child two level deep', () => {
    const changes = diffNode(node3, node4, '0')
    const expectedNested2: InsertNode = {
      action: 'insert_node',
      child: <box key="child11" position={vec0} />,
      nextPath: '0.child1.child11',
    }
    const expectedNested1: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: {
        0: [expectedNested2],
      },
    }
    const expected: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: {
        0: [expectedNested1],
      },
    }
    expect(changes).toEqual([expected])
  })

  test('replace node', () => {
    const changes = diffNode(node2, node5, '0')
    const expected: ReplaceNode = {
      action: 'replace_node',
      prevNode: node2,
      nextNode: node5,
      path: '0',
    }
    expect(changes).toEqual([expected])
  })

  test('replace node by null at one child level', () => {
    const changes = diffNode(node6, node7, '0')
    const expectedNested: ReplaceNode = {
      action: 'replace_node',
      prevNode: <box position={vec1} />,
      nextNode: VEmpty(),
      path: '0.0',
    }
    const expected: UpdateChildren = {
      action: 'update_chilren',
      indexedActions: {
        0: [expectedNested],
      },
    }
    expect(changes).toEqual([expected])
  })
})
