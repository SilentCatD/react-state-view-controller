import { PropsWithChildren, createContext, useEffect, useRef, useState } from 'react'
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
import { Subscription } from 'rxjs'
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

  const Builder: Builder<S> = ({ builder, buildWhen }: BuilderProps<S>) => {
    const controller = useController(controllerContext)
    const [state, setState] = useState(controller.state)
    const oldStateRef = useRef(controller.state)
    const subcriptionRef = useRef<Subscription | null>(null)

    const updateState = (newState: S) => {
      oldStateRef.current = newState
      setState(newState)
    }

    useEffect(() => {
      const subcription = controller.observable.subscribe((newState) => {
        if (oldStateRef.current === newState) {
          return
        }
        if (buildWhen) {
          if (buildWhen?.(oldStateRef.current, newState)) {
            updateState(newState)
          }
        } else {
          updateState(newState)
        }
      })
      subcriptionRef.current = subcription
      return () => {
        subcriptionRef.current?.unsubscribe()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildWhen])

    const renderComponent = () => {
      return builder(state)
    }

    return renderComponent()
  }

  controllerContext.Builder = Builder

  const Listener: Listener<S> = ({ listener, listenWhen, children }: PropsWithChildren<ListenerProps<S>>) => {
    const controller = useController(controllerContext)
    const subcriptionRef = useRef<Subscription | null>(null)
    const stateRef = useRef(controller.state)

    const emitState = (newState: S) => {
      listener(newState)
    }

    useEffect(() => {
      const subcription = controller.observable.subscribe((newState) => {
        const state = stateRef.current
        if (listenWhen) {
          if (listenWhen?.(state, newState)) {
            emitState(newState)
          }
        } else {
          emitState(newState)
        }
        stateRef.current = newState
      })
      subcriptionRef.current = subcription
      return () => {
        subcriptionRef.current?.unsubscribe()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listenWhen, listener])

    return <>{children}</>
  }

  controllerContext.Listener = Listener

  return controllerContext
}

export { createControllerContext }
