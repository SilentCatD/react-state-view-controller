import Controller from '../Controller'
import { Constructor, InferStateType, ShouldUpdate } from '../types'
import { useEffect, useRef } from 'react'
import { useControllerResolver } from './useControllerResolver'

function useListener<C extends Controller<InferStateType<C>>>(
  ctor: Constructor<C>,
  listener: (state: InferStateType<C>) => void,
  listenWhen?: ShouldUpdate<InferStateType<C>>,
): C

function useListener<C extends Controller<InferStateType<C>>>(
  controller: C,
  listener: (state: InferStateType<C>) => void,
  listenWhen?: ShouldUpdate<InferStateType<C>>,
): void

function useListener<C extends Controller<InferStateType<C>>>(
  source: Constructor<C> | C,
  listener: (state: InferStateType<C>) => void,
  listenWhen?: ShouldUpdate<InferStateType<C>>,
): C | undefined {
  const controller = useControllerResolver(source)
  const stateRef = useRef(controller.state)
  const listenerRef = useRef(listener)
  const listenWhenRef = useRef(listenWhen)

  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  useEffect(() => {
    listenWhenRef.current = listenWhen
  }, [listenWhen])

  useEffect(() => {
    const subscription = controller.observable.subscribe((state) => {
      const currentState = stateRef.current
      if (currentState === state) {
        return
      }
      if (listenWhenRef.current !== undefined) {
        if (listenWhenRef.current(currentState, state)) {
          listenerRef.current(state)
        }
      } else {
        listenerRef.current(state)
      }
      stateRef.current = state
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [controller])

  if (source instanceof Controller) {
    return undefined
  }
  return controller
}

export { useListener }
