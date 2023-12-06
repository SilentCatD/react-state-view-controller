import { ReactNode } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType, StateCompare } from '../types'
import { useControllerResolver } from '../hooks/useControllerResolver'
import { useSelector } from '../hooks/useSelector'

interface SelectorProps<C extends Controller<InferStateType<C>>, T> {
  source: Constructor<C> | C
  selector: (state: InferStateType<C>) => T
  stateCompare?: StateCompare<T>
  children: (value: T) => ReactNode
}

function Selector<C extends Controller<InferStateType<C>>, T>({
  source,
  selector,
  stateCompare,
  children,
}: SelectorProps<C, T>) {
  const controller = useControllerResolver(source)
  const value = useSelector(controller, selector, stateCompare)
  return children(value)
}

export { Selector, SelectorProps }
