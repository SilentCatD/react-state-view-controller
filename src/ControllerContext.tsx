import { PropsWithChildren, createContext, useEffect, useRef } from 'react'
import Controller from './Controller'
import {
  ControllerContext,
  ControllerProvider,
  Builder,
  Listener,
  ControllerProviderProps,
  BuilderProps,
  ListenerProps,
} from './types'
import { useBuilder } from './useBuilder'
import { useListener } from './useListener'
import { useController } from './useController'

function createControllerContext<C extends Controller<S>, S>(): ControllerContext<C, S> {
  const reactContext = createContext<C>(undefined as any)
  const controllerContext: ControllerContext<C, S> = {
    Provider: null as any,
    Builder: null as any,
    Listener: null as any,
    _context: reactContext,
  }

  const ControllerProvider: ControllerProvider<C, S> = ({
    create,
    children,
  }: PropsWithChildren<ControllerProviderProps<C, S>>) => {
    const controllerRef = useRef(create())
    useEffect(
      () => () => {
        controllerRef.current.dispose()
      },
      [],
    )
    return <reactContext.Provider value={controllerRef.current}>{children}</reactContext.Provider>
  }

  controllerContext.Provider = ControllerProvider

  const Builder: Builder<C, S> = ({ builder, buildWhen }: BuilderProps<C, S>) => {
    const [state, controller] = useBuilder(controllerContext, buildWhen)
    const renderComponent = () => {
      return builder(state, controller)
    }
    return renderComponent()
  }

  controllerContext.Builder = Builder

  const Listener: Listener<C, S> = ({ listener, listenWhen, children }: PropsWithChildren<ListenerProps<C, S>>) => {
    const controller = useController(controllerContext)
    useListener(controllerContext, (state) => listener(state, controller), listenWhen)
    return <>{children}</>
  }

  controllerContext.Listener = Listener

  return controllerContext
}

export { createControllerContext }
