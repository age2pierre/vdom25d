import { Record } from 'immutable'
import xs from 'xstream'

export class Clock extends Record({
  time: performance.now(),
  delta: 0,
}) {}

export default () => {
  const initState = new Clock()
  let requestId = 0

  const raf$ = xs.create<number>({
    start: listeners => {
      requestId = window.requestAnimationFrame(time => listeners.next(time))
    },
    stop: () => {
      window.cancelAnimationFrame(requestId)
    },
  })

  return raf$.fold((prevState, time) => {
    return prevState.merge({
      time,
      delta: time - prevState.time,
    })
  }, initState)
}
