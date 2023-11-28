import { PropsWithChildren, createContext } from 'react'
import Controller from './Controller'
import {
  ControllerContext,
  ControllerProvider,
  Builder,
  Listener,
  ControllerProviderProps,
  BuilderProps,
  ListenerProps,
  LinkedController,
} from './types'
import { useBuilder } from './useBuilder'
import { useListener } from './useListener'
import { useController } from './useController'
import { useAutoDispose } from './useAutoDispose'

function createControllerContext<C extends Controller<S>, S>(): ControllerContext<C, S> {
  const reactContext = createContext<C>(undefined as any)
  const controllerContext: ControllerContext<C, S> = {
    Provider: () => <></>,
    Builder: () => <></>,
    Listener: () => <></>,
    _context: reactContext,
  }

  const ControllerProvider: ControllerProvider<C, S> = ({
    create,
    children,
  }: PropsWithChildren<ControllerProviderProps<C, S>>) => {
    const controller = useAutoDispose<C, S>(() => create())
    return <reactContext.Provider value={controller}>{children}</reactContext.Provider>
  }

  controllerContext.Provider = ControllerProvider

  const Builder: Builder<C, S> = ({ builder, buildWhen }: BuilderProps<C, S>) => {
    const [state, controller] = useBuilder(controllerContext, buildWhen)
    return builder(state, controller)
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

function createLinkedControllerContext<C, S>(): ControllerContext<LinkedController<C, S>, S> {
  return createControllerContext<LinkedController<C, S>, S>()
}

export { createControllerContext, createLinkedControllerContext }
