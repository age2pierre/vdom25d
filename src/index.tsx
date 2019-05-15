import demoSpring from './demo/spring'
import { makeApp } from './lib'

const app = makeApp()

app.run(demoSpring(app.sources))
