import { Record } from 'immutable'
import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import fromEvent from 'xstream/extra/fromEvent'

export class Keyboard extends Record({
  up: false,
  down: false,
  left: false,
  right: false,
}) {}

export default () => {
  const initState = new Keyboard()

  const keys$ = xs.merge(
    fromEvent<KeyboardEvent>(document, 'keydown'),
    fromEvent<KeyboardEvent>(document, 'keyup'),
  )

  return keys$
    .fold((prev, event) => {
      const key: 'up' | 'down' | 'left' | 'right'
      switch (event.keyCode) {
        case 90:
          key = 'up'
          break
        case 81:
          key = 'left'
          break
        case 68:
          key = 'right'
          break
        case 83:
          key = 'down'
          break
        default:
          return prev
      }
      if (event.type === 'keydown') {
        prev.set(key, true)
      }
      if (event.type === 'keyup') {
        prev.set(key, false)
      }
      return prev
    }, initState)
    .compose(dropRepeats())
}
