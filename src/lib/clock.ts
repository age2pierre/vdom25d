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
      const cb = (time: number) => {
        listeners.next(time)
        requestId = window.requestAnimationFrame(cb)
      }
      requestId = window.requestAnimationFrame(cb)
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
