import xs from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'

export default () => {
  return xs.merge(
    fromEvent<KeyboardEvent>(document, 'keydown'),
    fromEvent<KeyboardEvent>(document, 'keyup'),
  )
}
