import { Color, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three'
import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { h } from '../lib'
import makeStore, { Action } from '../lib/drivers/store'
import { Sources } from '../lib/makeapp'
import { makeSpring } from '../lib/spring'
import { range } from '../lib/utils'
import { VNode } from '../lib/vdom/vdom'

export default function demoSpring(sources$: Sources): Stream<VNode> {
  // model
  interface StateApp {
    readonly pos: number
  }

  const reducer = (state: StateApp, action: Action) => {
    switch (action.type) {
      case 'SWITCH_POS':
        return {
          pos: -state.pos,
        }
    }
    return state
  }

  const store = makeStore<StateApp>(reducer, {
    pos: -5,
  })

  const actions$: Stream<Action> = xs.periodic(1500).mapTo({
    type: 'SWITCH_POS',
  })

  const state$ = store(actions$)

  const pos$ = state$.map(state => state.pos)
  const clock$ = sources$.map(t => t[0])
  const posistions$ = range(0, 6).map(i => {
    return makeSpring(clock$, 100 + i * 20, 40 - i * 5)(pos$)
  })

  // view
  const BallGeometry = new SphereGeometry(0.5, 16, 12)
  const NUM_COLORS = 6
  const BasicMats = range(0, NUM_COLORS)
    .map(i => {
      const c = new Color()
      c.setHSL((1 / NUM_COLORS) * i, 1, 0.5)
      return c
    })
    .map(
      color =>
        new MeshStandardMaterial({
          color,
          roughness: 1,
          metalness: 0,
        }),
    )

  const topPos = new Vector3(5, 10, 5)

  const AppComponent = (props: { readonly positions: number[] }) => (
    <group>
      {[
        <ambientLight key="light_1" intensity={0.2} castShadow={false} />,
        <directionalLight
          key="light_2"
          intensity={0.6}
          position={topPos}
          target={new Vector3()}
        />,
        props.positions.map((pos, index) => {
          return (
            <mesh
              key={`box_${index}`}
              position={new Vector3(pos, -4.5 + index * 2)}
              geometry={BallGeometry}
              material={BasicMats[index]}
            />
          )
        }),
      ]}
    </group>
  )

  const vnode$ = clock$
    .compose(sampleCombine(...posistions$))
    .map(([_, ...pos]) => {
      return pos as number[]
    })
    .map(positions => {
      return <AppComponent positions={positions} />
    })

  return vnode$
}
