import xs from 'xstream'

export interface Clock {
  readonly time: number
  readonly delta: number
}

export default () => {
  const initState: Clock = {
    time: performance.now(),
    delta: 0,
  }
  let requestId = 0

  const raf$ = xs.create<number>({
    start: listeners => {
      // tslint:disable-next-line:no-expression-statement
      requestId = window.requestAnimationFrame(time => listeners.next(time))
    },
    stop: () => {
      // tslint:disable-next-line:no-expression-statement
      window.cancelAnimationFrame(requestId)
    },
  })

  return raf$.fold(
    (prevState, time): Clock => ({
      time,
      delta: time - prevState.time,
    }),
    initState,
  )
}
