import xs, { Stream } from 'xstream'
import concat from 'xstream/extra/concat'
import { Clock } from '../drivers/clock'

// Credit to, adapted to xstream
// https://github.com/gvergnaud/rx-ease

const defaultSecondPerFrame = 0.016
/**
 * @param value the current value [T]
 * @param velocity the speed [T / s]
 * @param destValue the target value [T]
 * @param stiffness prop of the spring [kg / s^2]
 * @param damping prop of the spring [kg / s]
 * @param secondPerFrame delta time [s]
 * @param precision
 *
 * @returns tuple of [ newValue, newVelocity ]
 */
function stepper(
  value: number,
  velocity: number,
  destValue: number,
  stiffness = 170,
  damping = 20,
  secondPerFrame = defaultSecondPerFrame,
  precision = 0.1,
): [number, number] {
  // Spring stiffness, in kg / s^2

  // for animations, destValue is really spring length (spring at rest). initial
  // position is considered as the stretched/compressed position of a spring
  const Fspring = -stiffness * (value - destValue)

  // Damping, in kg / s
  const Fdamper = -damping * velocity

  // usually we put mass here, but for animation purposes, specifying mass is a
  // bit redundant. you could simply adjust k and b accordingly
  // let a = (Fspring + Fdamper) / mass
  const a = Fspring + Fdamper

  const newVelocity = velocity + a * secondPerFrame
  const newValue = value + newVelocity * secondPerFrame

  if (
    Math.abs(newVelocity) < precision &&
    Math.abs(newValue - destValue) < precision
  ) {
    return [destValue, 0]
  }

  return [newValue, newVelocity]
}

export const makeSpring = (
  clock$: Stream<Clock>,
  stiffness = 170,
  damping = 20,
) => {
  return (target$: Stream<number>) => {
    const init$ = target$.take(1)

    return concat(init$, xs
      .combine(target$, clock$)
      .fold(
        (acc, stream) => {
          const [value, velocity] = acc
          const [target, clock] = stream
          return stepper(
            value === undefined ? target : value,
            velocity as number,
            target,
            stiffness,
            damping,
            clock.delta,
          )
        },
        [undefined, 0],
      )
      .map(r => r[0])
      .drop(1) as Stream<number>)
  }
}
