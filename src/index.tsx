import xs, { Stream } from 'xstream'
import { AppComponent, store } from './demo/basic'
import { h, makeApp } from './lib'
import { Action } from './lib/drivers/store'

const app = makeApp()

const actions$: Stream<Action> = xs.periodic(200).mapTo({
  type: 'ADD_RANDOM',
})

const vnode$ = store(actions$).map(state => <AppComponent state={state} />)

app.run(vnode$)
