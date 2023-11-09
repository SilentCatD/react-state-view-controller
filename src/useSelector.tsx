import Controller from './Controller'
import { ControllerContext } from './types'
import { useBuilder } from './useBuilder'

function useSelector<C extends Controller<S>, S, T>(
  context: ControllerContext<C, S>,
  stateSelector: (state: S) => T,
): [T, C] {
  const buildWhen = (prev: S, curr: S) => stateSelector(prev) !== stateSelector(curr)
  const [state, controller] = useBuilder<C, S>(context, buildWhen)
  return [stateSelector(state), controller]
}

export { useSelector }
