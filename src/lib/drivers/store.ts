import { Stream } from 'xstream'

export interface Action {
  readonly type: string
  readonly payload?: any
}

export default function makeStore<State>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
): (saction$: Stream<Action>) => Stream<State> {
  return (input$: Stream<Action>) => {
    return input$.fold(reducer, initialState)
  }
}
