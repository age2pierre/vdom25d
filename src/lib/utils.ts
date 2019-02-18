export const ErrorLogger = <K, T extends (...args: any[]) => K | Error>(
  func: T,
  defaultValue: K,
) => (...args2: any[]): K => {
  const returnValue = func(args2)
  if (returnValue instanceof Error) {
    // tslint:disable-next-line:no-console
    console.error(returnValue)
    return defaultValue
  } else {
    return returnValue
  }
}

export const range = (start: number, stop: number, step = 1): number[] => {
  return Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step)
}
