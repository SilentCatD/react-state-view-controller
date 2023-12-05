import Controller from '../Controller'
import { Constructor, InferStateType } from '../types'
import { useBuilder } from './useBuilder'
import { useControllerResolver } from './useControllerResolver'

function useSelector<C extends Controller<InferStateType<C>>, T>(
  ctor: Constructor<C>,
  selector: (state: InferStateType<C>) => T,
): [T, C]

function useSelector<C extends Controller<InferStateType<C>>, T>(
  controller: C,
  selector: (state: InferStateType<C>) => T,
): T

function useSelector<C extends Controller<InferStateType<C>>, T>(
  source: Constructor<C> | C,
  selector: (state: InferStateType<C>) => T,
): [T, C] | T {
  const controller = useControllerResolver(source)
  const state = useBuilder(controller, (prev, curr) => {
    return selector(prev) != selector(curr)
  })
  if (source instanceof Controller) {
    return selector(state)
  }
  return [selector(state), controller]
}

export { useSelector }
