import { Stream } from 'xstream'
import fromDiagram from 'xstream/extra/fromDiagram'
import { makeSpring } from '.'
import { Clock } from '../drivers/clock'

describe('spring', () => {
  const clock$: Stream<Clock> = fromDiagram(
    '-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-|',
    {
      values: {
        a: {
          time: 100,
          delta: 0.016,
        },
      },
    },
  )

  const target$: Stream<number> = fromDiagram(
    'a--------b--------a-------b------|',
    {
      values: {
        a: 0,
        b: 1,
      },
    },
  )

  const result$ = makeSpring(clock$)(target$)

  test('mock', () => {
    const mut_array: number[] = []
    result$.addListener({
      next: x => {
        console.log(x)
        mut_array.push(x)
      },
      complete: () => {
        expect(mut_array.length).toBeGreaterThan(0)
      },
    })
  })
})
