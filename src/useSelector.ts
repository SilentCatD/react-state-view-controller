import Controller from './Controller'
import { ControllerContext } from './types'
import { useBuilder } from './useBuilder'
import { useControllerInternal } from './useController'

function useSelector<C extends Controller<S>, S, T>(
  context: ControllerContext<C, S>,
  stateSelector: (state: S) => T,
): [T, C]
function useSelector<C extends Controller<S>, S, T>(controller: C, stateSelector: (state: S) => T): T
function useSelector<C extends Controller<S>, S, T>(
  source: ControllerContext<C, S> | C,
  stateSelector: (state: S) => T,
): [T, C] | T {
  const controller = useControllerInternal(source) as C
  const buildWhen = (prev: S, curr: S) => stateSelector(prev) !== stateSelector(curr)
  const state = useBuilder<C, S>(controller, buildWhen)
  if (source instanceof Controller) {
    return stateSelector(state)
  }
  return [stateSelector(state), controller]
}

export { useSelector }
