import { useCallback } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType, StateCompare } from '../types'
import { useBuilder } from './useBuilder'
import { useControllerResolver } from './useControllerResolver'

function useSelector<C extends Controller<InferStateType<C>>, T>(
  ctor: Constructor<C>,
  selector: (state: InferStateType<C>) => T,
  stateCompare?: StateCompare<T>,
): [T, C]

function useSelector<C extends Controller<InferStateType<C>>, T>(
  controller: C,
  selector: (state: InferStateType<C>) => T,
  stateCompare?: StateCompare<T>,
): T

function useSelector<C extends Controller<InferStateType<C>>, T>(
  source: Constructor<C> | C,
  selector: (state: InferStateType<C>) => T,
  stateCompare?: StateCompare<T>,
): [T, C] | T {
  const controller = useControllerResolver(source)
  const buildWhenCallback = useCallback(
    (prev: InferStateType<C>, curr: InferStateType<C>) => {
      return stateCompare?.(selector(prev), selector(curr)) ?? true
    },
    [selector, stateCompare],
  )
  const state = useBuilder(controller, buildWhenCallback)
  if (source instanceof Controller) {
    return selector(state)
  }
  return [selector(state), controller]
}

export { useSelector }
