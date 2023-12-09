import Controller from '../Controller'
import { Constructor, InferStateType, ShouldUpdate, StateCompare } from '../types'
import { useCallback, useEffect, useRef } from 'react'
import { useControllerResolver } from './useControllerResolver'
import { isEqual } from '../utils'

function useListener<C extends Controller<InferStateType<C>>>(
  ctor: Constructor<C>,
  listener: (state: InferStateType<C>, controller: C) => void,
  listenWhen?: ShouldUpdate<InferStateType<C>>,
  stateCompare?: StateCompare<InferStateType<C>>,
): C

function useListener<C extends Controller<InferStateType<C>>>(
  controller: C,
  listener: (state: InferStateType<C>) => void,
  listenWhen?: ShouldUpdate<InferStateType<C>>,
  stateCompare?: StateCompare<InferStateType<C>>,
): void

function useListener<C extends Controller<InferStateType<C>>>(
  source: Constructor<C> | C,
  listener: (state: InferStateType<C>, controller?: C) => void,
  listenWhen?: ShouldUpdate<InferStateType<C>>,
  stateCompare?: StateCompare<InferStateType<C>>,
): C | undefined {
  const controller = useControllerResolver(source)
  const stateRef = useRef(controller.state)
  const listenerRef = useRef(listener)
  const listenWhenRef = useRef(listenWhen)
  const defaultStateCompareCallback = useCallback(
    (prev: InferStateType<C>, curr: InferStateType<C>) => isEqual(prev, curr),
    [],
  )
  const stateCompareRef = useRef(defaultStateCompareCallback)

  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  useEffect(() => {
    listenWhenRef.current = listenWhen
  }, [listenWhen])

  useEffect(() => {
    if (stateCompare !== undefined) {
      stateCompareRef.current = stateCompare
    } else {
      stateCompareRef.current = defaultStateCompareCallback
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateCompare])

  useEffect(() => {
    const subscription = controller.observable.subscribe((state) => {
      const currentState = stateRef.current
      if (stateCompareRef.current(currentState, state)) {
        return
      }
      if (listenWhenRef.current !== undefined) {
        if (listenWhenRef.current(currentState, state)) {
          listenerRef.current(state, controller)
        }
      } else {
        listenerRef.current(state, controller)
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
