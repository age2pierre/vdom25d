import { Stream } from 'xstream'
import fromDiagram from 'xstream/extra/fromDiagram'
import { h } from '../lib'
import makeapp from '../lib/makeapp'
import { Action } from '../lib/store'
import { AppComponent, store } from './basic'

describe.only('demo basic', () => {
  const app = makeapp('threeContainer', true)

  const actions$: Stream<Action> = fromDiagram('-a-a-|', {
    values: { a: { type: 'ADD_RANDOM' } },
  })

  const vnode$ = store(actions$).map(state => <AppComponent state={state} />)

  app.run(vnode$)

  test('mock', () => {
    expect(app).toBeDefined()
  })
})
