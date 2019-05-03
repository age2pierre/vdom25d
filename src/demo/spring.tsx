import { Color, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';
import { h } from '../lib';
import makeStore, { Action } from '../lib/drivers/store';
import { range } from '../lib/utils';

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

export const store = makeStore<StateApp>(reducer, {
  pos: -5,
})

const BallGeometry = new SphereGeometry(0.5)
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

export const AppComponent = (props: { readonly position: number }) => (
  <group>
    {[
      <ambientLight key="light_1" intensity={0.2} castShadow={false} />,
      <directionalLight
        key="light_2"
        intensity={0.6}
        position={topPos}
        target={new Vector3()}
      />,
      // range(0, 5).map((r, index) => {
        // return (
          <mesh
            key={`box`}
            position={new Vector3(0, props.position)}
            geometry={BallGeometry}
            material={BasicMats[0]}
          />
        // )
      }),
    ]}
  </group>
)
