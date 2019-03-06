export const ErrorLogger = <K, T extends (...args: any[]) => K | Error>(
  func: T,
  defaultValue?: K,
) => (...args2: any[]): K => {
  const returnValue = func(args2)
  if (returnValue instanceof Error) {
    // tslint:disable-next-line:no-console
    console.error(returnValue)
  }
  return defaultValue ? defaultValue : (returnValue as K)
}

export const range = (start: number, stop: number, step = 1): number[] => {
  // tslint:disable-next-line: no-array-mutation
  return Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step)
}

export function assertNever(x: never): Error {
  return new Error('Unexpected object: ' + x)
}

export function entries<T>(
  obj: T,
): Array<{ readonly key: keyof T; readonly val: T[keyof T] }> {
  return Object.entries(obj).map(entry => {
    return {
      key: entry[0] as keyof T,
      val: entry[1] as T[keyof T],
    }
  })
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export const pipe = <T extends any[], R>(
  fn1: (...args: T) => R,
  ...fns: Array<(a: R) => R>
) => {
  const piped = fns.reduce(
    (prevFn, nextFn) => (value: R) => nextFn(prevFn(value)),
    value => value,
  )
  return (...args: T) => piped(fn1(...args))
}

export const compose = <R>(fn1: (a: R) => R, ...fns: Array<(a: R) => R>) =>
  fns.reduce((prevFn, nextFn) => value => prevFn(nextFn(value)), fn1)
