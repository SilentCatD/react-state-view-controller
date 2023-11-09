import Controller from './Controller'
import { ControllerContext } from './types'
import { useBuilder } from './useBuilder'

function useSelector<C extends Controller<S>, S, T>(
  context: ControllerContext<C, S>,
  stateSelector: (state: S) => T,
): [T, C] {
  const [state, controller] = useBuilder(context, (prev, curr) => stateSelector(prev) !== stateSelector(curr))
  return [stateSelector(state), controller]
}

export { useSelector }
