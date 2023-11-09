import { useEffect, useRef } from 'react'
import Controller from './Controller'
import { ControllerContext, ListenerListenWhen } from './types'
import { useController } from './useController'

function useListener<C extends Controller<S>, S>(
  context: ControllerContext<C, S>,
  listener: (state: S) => void,
  listenWhen: ListenerListenWhen<S> = () => true,
): C {
  const controller = useController<C, S>(context) as C
  const stateRef = useRef<S>(controller.state)

  const callback = (newState: S) => listener(newState)

  useEffect(() => {
    const subcription = controller.observable.subscribe((newState) => {
      const state = stateRef.current
      if (state === newState) {
        return
      }
      if (listenWhen(state, newState) === true) {
        callback(newState)
      }
      stateRef.current = newState
    })
    return () => {
      subcription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listenWhen, listener])

  return controller
}

export { useListener }
