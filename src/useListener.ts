import { useCallback, useEffect, useRef } from 'react'
import Controller from './Controller'
import { ControllerContext, ListenerListenWhen } from './types'
import { useControllerInternal } from './useController'
import { isEquals } from './utils'

function useListener<C extends Controller<S>, S>(
  context: ControllerContext<C, S>,
  listener: (state: S) => void,
  listenWhen?: ListenerListenWhen<S>,
): C

function useListener<C extends Controller<S>, S>(
  controller: C,
  listener: (state: S) => void,
  listenWhen?: ListenerListenWhen<S>,
): void

function useListener<C extends Controller<S>, S>(
  source: ControllerContext<C, S> | C,
  listener: (state: S) => void,
  listenWhen?: ListenerListenWhen<S>,
): C | void {
  const controller = useControllerInternal<C, S>(source) as C
  const stateRef = useRef<S>(controller.state)

  const callback = useCallback((newState: S) => listener(newState), [listener])

  useEffect(() => {
    const subcription = controller.observable.subscribe((newState) => {
      const state = stateRef.current
      if (isEquals(state, newState)) {
        return
      }
      if (listenWhen?.(state, newState) ?? true) {
        callback(newState)
      }
      stateRef.current = newState
    })
    return () => {
      subcription.unsubscribe()
    }
  }, [callback, controller.observable, listenWhen])

  if (source instanceof Controller) {
    return
  }
  return controller
}

export { useListener }
