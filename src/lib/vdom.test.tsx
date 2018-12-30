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
  test('native element without children', () => {
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

  test('native element with children', () => {
    const node = (
      <box x={3} y={4}>
        <box x={5} y={6} />
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
            key: undefined,
            children: List(),
          }),
        ]),
      }),
    )
  })

  test('Thunk element', () => {
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

// describe.skip('VNode diffing', () => {
//   const node1 = <box x={2} y={2} />
//   const node2 = <box x={3} y={3} />

//   test('Update props', () => {
//     const op = diff(node1, node2)
//     expect(op.toJS()).toEqual([
//       { op: 'replace', path: ['attributes', 'x'], value: 3 },
//       { op: 'replace', path: ['attributes', 'y'], value: 3 },
//     ])
//   })

//   const node3 = (
//     <box x={1} y={1}>
//       <box key="child1" x={2} y={2} />
//     </boxMap>
//   )
//   const node4 = (
//     <box x={1} y={1}>
//       <box key="child1" x={2} y={2} />
//       <box key="child2" x={3} y={3} />
//     </box>
//   )
//   const node5 = (
//     <box x={1} y={1}>
//       <box key="child1" x={2} y={2} />
//       <group key="child3" />
//     </box>
//   )
//   const node6 = (
//     <box x={1} y={1}>
//       <box key="child1" x={2} y={2} />
//       {null}
//     </box>
//   )
//   test('Add child', () => {
//     const op = diff(node3, node4)
//     expect(op).toEqual(
//       List([Map({ op: 'add', path: List(['children', 1]), value: node2 })]),
//     )
//   })

//   test('Remove child', () => {
//     const op = diff(node4, node3)
//     expect(op).toEqual(
//       List([Map({ op: 'remove', path: List(['children', 1]) })]),
//     )
//   })

//   test('Replace child', () => {
//     const op = diff(node4, node5)
//     expect(op.toJS()).toEqual([
//       {
//         op: 'replace',
//         path: ['children', 1, 'tagName'],
//         value: 'group',
//       },
//       {
//         op: 'replace',
//         path: ['children', 1, 'key'],
//         value: 'child3',
//       },
//       {
//         op: 'replace',
//         path: ['children', 1, 'attributes'],
//         value: undefined,
//       },
//     ])
//   })

//   test('Replace child with empty', () => {
//     const op = diff(node4, node6)
//     expect(op.toJS()).toEqual([{}, {}])
//   })

//   test('Create root', () => {
//     const op = diff(null as any, <group />)
//     expect(op).toEqual(
//       List([
//         Map({
//           op: 'replace',
//           path: List([]),
//           value: Map({
//             type: 'native',
//             tagName: 'group',
//             attributes: undefined,
//             key: undefined,
//             children: List(),
//           }),
//         }),
//       ]),
//     )
//   })
// })
