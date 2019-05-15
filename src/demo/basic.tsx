import { Color, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three'
import xs, { Stream } from 'xstream'
import { h } from '../lib'
import makeStore, { Action } from '../lib/drivers/store'
import { Sources } from '../lib/makeapp'
import { randomFloat, range } from '../lib/utils'
import { VNode } from '../lib/vdom/vdom'

export function demoBasic(_sources$: Sources): Stream<VNode> {
  // model
  interface StateApp {
    readonly boxes: Array<{
      readonly x: number
      readonly y: number
    }>
  }

  const reducer = (state: StateApp, action: Action) => {
    switch (action.type) {
      case 'ADD_RANDOM':
        return {
          boxes: [
            ...state.boxes,
            {
              x: randomFloat(),
              y: randomFloat(),
              color: new Color(Math.random(), Math.random(), Math.random()),
            },
          ],
        }
    }
    return state
  }

  const store = makeStore<StateApp>(reducer, {
    boxes: [
      {
        x: 0,
        y: 0,
      },
    ],
  })

  // view
  const ballGeometry = new SphereGeometry(0.5)
  const NUM_COLORS = 6
  const basicMats = range(0, NUM_COLORS)
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

  const AppComponent = (props: { readonly state: StateApp }) => (
    <group>
      {[
        <ambientLight key="light_1" intensity={0.2} castShadow={false} />,
        <directionalLight
          key="light_2"
          intensity={0.6}
          position={topPos}
          target={new Vector3()}
        />,
        ...props.state.boxes.map((box, index) => {
          return (
            <mesh
              key={`box_${index}`}
              position={new Vector3(box.x, box.y)}
              geometry={ballGeometry}
              material={basicMats[index % NUM_COLORS]}
            />
          )
        }),
      ]}
    </group>
  )

  // intent
  const actions$: Stream<Action> = xs.periodic(200).mapTo({
    type: 'ADD_RANDOM',
  })

  // app
  const vnode$ = store(actions$).map(state => <AppComponent state={state} />)

  return vnode$
}
