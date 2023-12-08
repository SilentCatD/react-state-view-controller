import { ReactNode } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType, StateCompare } from '../types'
import { useControllerResolver } from '../hooks/useControllerResolver'
import { useSelector } from '../hooks/useSelector'

interface SelectorControllerProps<C extends Controller<InferStateType<C>>, T> {
  source: C
  selector: (state: InferStateType<C>) => T
  stateCompare?: StateCompare<T>
  children?: (value: T) => ReactNode
}
interface SelectorCtorProps<C extends Controller<InferStateType<C>>, T> {
  source: Constructor<C>
  selector: (state: InferStateType<C>) => T
  stateCompare?: StateCompare<T>
  children?: (value: T, controller: C) => ReactNode
}

interface SelectorProps<C extends Controller<InferStateType<C>>, T> {
  source: Constructor<C> | C
  selector: (state: InferStateType<C>) => T
  stateCompare?: StateCompare<T>
  children?: (value: T, controller?: C) => ReactNode
}

function Selector<C extends Controller<InferStateType<C>>, T>(
  props: SelectorControllerProps<C, T>,
): ReactNode | undefined
function Selector<C extends Controller<InferStateType<C>>, T>(props: SelectorCtorProps<C, T>): ReactNode | undefined
function Selector<C extends Controller<InferStateType<C>>, T>({
  source,
  selector,
  stateCompare,
  children,
}: SelectorProps<C, T>): ReactNode | undefined {
  const controller = useControllerResolver(source)
  const value = useSelector(controller, selector, stateCompare)
  return children?.(value, controller)
}

export { Selector, SelectorProps, SelectorControllerProps, SelectorCtorProps }
