import { List, Map } from 'immutable'
import diff from 'immutable-diff'
import { h, VNative } from './vdom'

describe('Immutable.Map diff operations', () => {
  const map1 = Map({})
  const map2 = Map({ key1: 'val1' })
  const map3 = Map({ key1: 'val2' })
  const map4 = Map({ key2: 'val10' })

  test('add op', () => {
    const op = diff(map1, map2)
    expect(
      op.equals(
        List([
          Map({
            op: 'add',
            path: List(['key1']),
            value: 'val1',
          }),
        ]),
      ),
    ).toBe(true)
  })

  test('replace op', () => {
    const op = diff(map2, map3)
    expect(op.toJS()).toEqual([
      {
        op: 'replace',
        path: ['key1'],
        value: 'val2',
      },
    ])
  })

  test('remove op', () => {
    const op = diff(map2, map1)
    expect(op.toJS()).toEqual([
      {
        op: 'remove',
        path: ['key1'],
      },
    ])
  })

  test('remove then add ops', () => {
    const op = diff(map2, map4)
    expect(op.toJS()).toEqual([
      {
        op: 'remove',
        path: ['key1'],
      },
      {
        op: 'add',
        path: ['key2'],
        value: 'val10',
      },
    ])
  })
})

describe('VNode creation', () => {
  test('native node without children', () => {
    const node = <box x={1} y={2} />
    expect(node).toEqual(
      new VNative({
        type: 'native',
        tagName: 'box',
        attributes: Map({
          x: 1,
          y: 2,
        }),
        key: undefined,
        children: List(),
      }),
    )
  })

  test('native node with children', () => {
    const node = (
      <box x={3} y={4}>
        <box x={5} y={6} key="child1" />
        <box x={5} y={6} key="child2" />
      </box>
    )
    expect(node).toEqual(
      new VNative({
        type: 'native',
        tagName: 'box',
        attributes: Map({
          x: 3,
          y: 4,
        }),
        key: undefined,
        children: List([
          new VNative({
            type: 'native',
            tagName: 'box',
            attributes: Map({
              x: 5,
              y: 6,
            }),
            key: 'child1',
            children: List(),
          }),
          new VNative({
            type: 'native',
            tagName: 'box',
            attributes: Map({
              x: 5,
              y: 6,
            }),
            key: 'child2',
            children: List(),
          }),
        ]),
      }),
    )
  })

  test('Thunk node should be converted to native node', () => {
    const Thunk = (props: { arg: number }) => (
      <box x={props.arg} y={props.arg} />
    )
    const node = <Thunk arg={7} />
    expect(node).toEqual(
      new VNative({
        type: 'native',
        tagName: 'box',
        attributes: Map({
          x: 7,
          y: 7,
        }),
        key: undefined,
        children: List(),
      }),
    )
  })
})

// describe.skip('group by key', () => {
//   const children1 = List([
//     <box x={1} y={1} key="child1" />,
//     <box x={1} y={1} />,
//   ])
//   const children2 = List([<box x={1} y={1} />, <box x={1} y={1} />])
// })
