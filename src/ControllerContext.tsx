import { PropsWithChildren, createContext, useEffect, useReducer, useRef } from 'react'
import Controller from './Controller'
import {
  ControllerContext,
  ControllerProvider,
  BuilderAction,
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

  const stateReducer = (state: S, action: BuilderAction<S>): S => {
    switch (action.type) {
      case 'newstate':
        if (state === action.payload) {
          return state
        }
        if (action.buildWhen) {
          if (action.buildWhen?.(state, action.payload)) {
            return action.payload
          }
          return state
        }
        return action.payload
    }
  }

  const Builder: Builder<S> = ({ builder, buildWhen }: BuilderProps<S>) => {
    const controller = useController(controllerContext)
    const [state, dispatch] = useReducer(stateReducer, controller.state)
    const subcriptionRef = useRef<Subscription | null>(null)

    useEffect(() => {
      const subcription = controller.subject.subscribe((newState) => {
        dispatch({
          type: 'newstate',
          payload: newState,
          buildWhen: buildWhen,
        })
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
      const subcription = controller.subject.subscribe((newState) => {
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
