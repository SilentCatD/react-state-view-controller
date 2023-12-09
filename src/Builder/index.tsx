import { ReactNode } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType, ShouldUpdate, StateCompare } from '../types'
import { useControllerResolver } from '../hooks/useControllerResolver'
import { useBuilder } from '../hooks/useBuilder'

interface BuilderControllerProps<C extends Controller<InferStateType<C>>> {
  source: C
  buildWhen?: ShouldUpdate<InferStateType<C>>
  stateCompare?: StateCompare<InferStateType<C>>
  children?: (state: InferStateType<C>) => ReactNode
}
interface BuilderCtorProps<C extends Controller<InferStateType<C>>> {
  source: Constructor<C>
  buildWhen?: ShouldUpdate<InferStateType<C>>
  stateCompare?: StateCompare<InferStateType<C>>
  children?: (state: InferStateType<C>, controller: C) => ReactNode
}

interface BuilderProps<C extends Controller<InferStateType<C>>> {
  source: Constructor<C> | C
  buildWhen?: ShouldUpdate<InferStateType<C>>
  stateCompare?: StateCompare<InferStateType<C>>
  children?: (state: InferStateType<C>, controller?: C) => ReactNode
}

function Builder<C extends Controller<InferStateType<C>>>(props: BuilderCtorProps<C>): ReactNode | undefined
function Builder<C extends Controller<InferStateType<C>>>(props: BuilderControllerProps<C>): ReactNode | undefined
function Builder<C extends Controller<InferStateType<C>>>({
  source,
  buildWhen,
  stateCompare,
  children,
}: BuilderProps<C>): ReactNode | undefined {
  const controller = useControllerResolver(source)
  const state = useBuilder(controller, buildWhen, stateCompare)
  return children?.(state, controller)
}

export { Builder }
export type { BuilderProps, BuilderControllerProps, BuilderCtorProps }
