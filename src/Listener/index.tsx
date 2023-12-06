import { ReactNode } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType, ShouldUpdate, StateCompare } from '../types'
import { useListener } from '../hooks/useListener'
import { useControllerResolver } from '../hooks/useControllerResolver'

interface ListenerProps<C extends Controller<InferStateType<C>>> {
  source: Constructor<C> | C
  listener: (state: InferStateType<C>) => void
  listenWhen?: ShouldUpdate<InferStateType<C>>
  stateCompare?: StateCompare<InferStateType<C>>
  children?: ReactNode
}

function Listener<C extends Controller<InferStateType<C>>>({
  source,
  listener,
  listenWhen,
  stateCompare,
  children,
}: ListenerProps<C>) {
  const controller = useControllerResolver(source)
  useListener(controller, listener, listenWhen, stateCompare)
  return children
}

export { Listener, ListenerProps }
