export default function(start: number, stop: number, step = 1): number[] {
  return Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step)
}
