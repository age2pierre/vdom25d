import { h, makeApp } from './lib'

const app = makeApp()

const main = app.source.map(t => {
  return <box x={0} y={0} />
})

app.sink(main)
