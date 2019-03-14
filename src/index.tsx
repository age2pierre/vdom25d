import { Color3, StandardMaterial, Vector3 } from 'babylonjs';
import xs, { Stream } from 'xstream';
import { h, makeApp } from './lib';
import makeStore, { Action, State as StateApp } from './lib/store';
import { randomFloat } from './lib/utils';

interface StateApp {
  readonly boxes: Array<{
    readonly x: number
    readonly y: number
    readonly color: Color3
  }>
}

const actions$: Stream<Action> = xs.periodic(500).mapTo({
  type: 'ADD_RANDOM',
})

const reducer = (state: StateApp, action: Action) => {
  switch (action.type) {
    case 'ADD_RANDOM':
      return {
        boxes: [
          ...state.boxes,
          { x: randomFloat(), y: randomFloat(), color: Color3.Random() },
        ],
      }
  }
  return state
}

const store = makeStore<StateApp>(reducer, {
  boxes: [{ x: 0, y: 0, color: Color3.Red() }],
})

const app = makeApp('renderCanvas')

const AppComponent = (props: { readonly state: StateApp }) => (
  <group>
    {props.state.boxes.map((box, index) => {
      const mutableMat = new StandardMaterial('box_material', app.context.scene)
      mutableMat.diffuseColor = box.color
      return (
        <box
          key={`box_${index}`}
          position={new Vector3(box.x, box.y)}
          material={mutableMat}
        />
      )
    })}
  </group>
)

const vnode$ = store(actions$).map(state => <AppComponent state={state} />)

app.run(vnode$)
