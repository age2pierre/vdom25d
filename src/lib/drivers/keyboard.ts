import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import fromEvent from 'xstream/extra/fromEvent'

export interface Keyboard {
  readonly up: boolean
  readonly down: boolean
  readonly left: boolean
  readonly right: boolean
}

export default () => {
  const initState: Keyboard = {
    down: false,
    left: false,
    right: false,
    up: false,
  }

  const keys$ = xs.merge(
    fromEvent<KeyboardEvent>(document, 'keydown'),
    fromEvent<KeyboardEvent>(document, 'keyup'),
  )

  return keys$
    .fold((prev, event) => {
      let key: 'up' | 'down' | 'left' | 'right'
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
        return {
          ...prev,
          [key]: true,
        }
      }
      if (event.type === 'keyup') {
        return {
          ...prev,
          [key]: false,
        }
      }
      return prev
    }, initState)
    .compose(dropRepeats())
}
