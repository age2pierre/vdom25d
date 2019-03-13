import { groupByKey, h, VEmpty, VNative, VThunk } from './vdom'

describe('VNode creation', () => {
  test('native node without children', () => {
    const node = <tag x={1} y={2} />
    expect(node).toEqual(
      VNative({
        type: 'native',
        tagName: 'tag',
        attributes: {
          x: 1,
          y: 2,
        },
        key: undefined,
        children: [],
      }),
    )
  })

  test('native node with children', () => {
    const node = (
      <tag x={3} y={4}>
        <tag x={5} y={6} key="child1" />
        <tag x={5} y={6} key="child2" />
      </tag>
    )
    expect(node).toEqual(
      VNative({
        type: 'native',
        tagName: 'tag',
        attributes: {
          x: 3,
          y: 4,
        },
        key: undefined,
        children: [
          VNative({
            type: 'native',
            tagName: 'tag',
            attributes: {
              x: 5,
              y: 6,
            },
            key: 'child1',
            children: [],
          }),
          VNative({
            type: 'native',
            tagName: 'tag',
            attributes: {
              x: 5,
              y: 6,
            },
            key: 'child2',
            children: [],
          }),
        ],
      }),
    )
  })

  test('vnode with empty child', () => {
    const node = <group>{null}</group>
    expect(node).toEqual(
      VNative({
        type: 'native',
        tagName: 'group',
        attributes: {},
        key: undefined,
        children: [VEmpty()],
      }),
    )
  })

  test('Thunk node should be converted to native node', () => {
    interface ThunkProps {
      readonly arg: number
    }
    const Thunk = (props: ThunkProps) => <tag x={props.arg} y={props.arg} />
    const node = <Thunk arg={7} />
    expect(node).toEqual(
      VThunk({
        fn: Thunk,
        props: {
          arg: 7,
        },
        key: undefined,
        children: [],
      }),
    )
  })
})

describe('group by key', () => {
  test('children with and without key', () => {
    const node1 = <tag x={1} y={1} key="child1" />
    const node2 = <tag x={1} y={1} />
    const children = [node1, node2]
    const groupedNodes = groupByKey(children)

    expect(groupedNodes).toEqual({
      child1: {
        node: node1,
        index: 0,
      },
      '1': {
        node: node2,
        index: 1,
      },
    })
  })
})
