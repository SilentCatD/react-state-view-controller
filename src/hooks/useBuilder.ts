import { useCallback, useState } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType, ShouldUpdate } from '../types'
import { useControllerResolver } from './useControllerResolver'
import { useListener } from './useListener'

function useBuilder<C extends Controller<InferStateType<C>>>(
  ctor: Constructor<C>,
  buildWhen?: ShouldUpdate<InferStateType<C>>,
): [InferStateType<C>, C]

function useBuilder<C extends Controller<InferStateType<C>>>(
  controller: C,
  buildWhen?: ShouldUpdate<InferStateType<C>>,
): InferStateType<C>

function useBuilder<C extends Controller<InferStateType<C>>>(
  source: Constructor<C> | C,
  buildWhen?: ShouldUpdate<InferStateType<C>>,
): [InferStateType<C>, C] | InferStateType<C> {
  const controller = useControllerResolver(source)
  const [state, setState] = useState(controller.state)

  const setStateCallback = useCallback((state: InferStateType<C>) => {
    setState(state)
  }, [])

  useListener(controller, setStateCallback, buildWhen)
  if (source instanceof Controller) {
    return state
  }
  return [state, controller]
}

export { useBuilder }
