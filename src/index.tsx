import { StandardMaterial, Vector3 } from 'babylonjs'
import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { h, makeApp } from './lib'
import makeStore, { Action } from './store'

const actions$: Stream<Action> = xs.periodic(500).mapTo({
  type: 'ADD_RANDOM',
})
const store$ = makeStore()(actions$)

const app = makeApp('renderCanvas')

const main = app.sources
  .map(([clock]) => clock)
  .compose(sampleCombine(store$))
  .map(([clock, state]) => (
    <group>
      {state.boxes.map((box, index) => {
        const mutableMat = new StandardMaterial(
          'box_material',
          app.context.scene,
        )
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
  ))

app.sinks.babylon(main)
