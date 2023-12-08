import { ReactNode, useCallback } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType, ShouldUpdate, StateCompare } from '../types'
import { useListener } from '../hooks/useListener'
import { useControllerResolver } from '../hooks/useControllerResolver'

interface ListenerControllerProps<C extends Controller<InferStateType<C>>> {
  source: C
  listener: (state: InferStateType<C>) => void
  listenWhen?: ShouldUpdate<InferStateType<C>>
  stateCompare?: StateCompare<InferStateType<C>>
  children?: ReactNode
}
interface ListenerCtorProps<C extends Controller<InferStateType<C>>> {
  source: Constructor<C>
  listener: (state: InferStateType<C>, controller: C) => void
  listenWhen?: ShouldUpdate<InferStateType<C>>
  stateCompare?: StateCompare<InferStateType<C>>
  children?: ReactNode
}

interface ListenerProps<C extends Controller<InferStateType<C>>> {
  source: Constructor<C> | C
  listener: (state: InferStateType<C>, controller?: C) => void
  listenWhen?: ShouldUpdate<InferStateType<C>>
  stateCompare?: StateCompare<InferStateType<C>>
  children?: ReactNode
}

function Listener<C extends Controller<InferStateType<C>>>(props: ListenerCtorProps<C>): ReactNode | undefined
function Listener<C extends Controller<InferStateType<C>>>(props: ListenerControllerProps<C>): ReactNode | undefined
function Listener<C extends Controller<InferStateType<C>>>({
  source,
  listener,
  listenWhen,
  stateCompare,
  children,
}: ListenerProps<C>): ReactNode | undefined {
  const controller = useControllerResolver(source)
  const listenerCallback = useCallback(
    (state: InferStateType<C>) => {
      listener(state, controller)
    },
    [listener, controller],
  )
  useListener(controller, listenerCallback, listenWhen, stateCompare)
  return children
}

export { Listener, ListenerProps, ListenerControllerProps, ListenerCtorProps }
