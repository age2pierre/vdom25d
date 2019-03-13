import { Color3 } from 'babylonjs'
import { Stream } from 'xstream'
import { randomFloat } from './lib/utils'

export interface Action {
  readonly type: string
  readonly payload?: any
}

export interface State {
  readonly boxes: Array<{
    readonly x: number
    readonly y: number
    readonly color: Color3
  }>
}

export default function makeStore(initialState: State = { boxes: [] }) {
  return (input$: Stream<Action>) => {
    return input$.fold((state, action) => {
      switch (action.type) {
        case 'ADD_RANDOM':
          return {
            boxes: [
              ...state.boxes,
              { x: randomFloat(), y: randomFloat(), color: Color3.Random() },
            ],
          }
      }
      return state
    }, initialState)
  }
}
