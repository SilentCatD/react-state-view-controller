import { ReactNode } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType, ShouldUpdate, StateCompare } from '../types'
import { useControllerResolver } from '../hooks/useControllerResolver'
import { useBuilder } from '../hooks/useBuilder'

interface BuilderProps<C extends Controller<InferStateType<C>>> {
  source: Constructor<C> | C
  buildWhen?: ShouldUpdate<InferStateType<C>>
  stateCompare?: StateCompare<InferStateType<C>>
  children: (state: InferStateType<C>) => ReactNode
}

function Builder<C extends Controller<InferStateType<C>>>({
  source,
  buildWhen,
  stateCompare,
  children,
}: BuilderProps<C>) {
  const controller = useControllerResolver(source)
  const state = useBuilder(controller, buildWhen, stateCompare)
  return children(state)
}

export { Builder, BuilderProps }
