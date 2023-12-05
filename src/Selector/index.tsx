import { ReactNode } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType } from '../types'
import { useControllerResolver } from '../hooks/useControllerResolver'
import { useSelector } from '../hooks/useSelector'

interface SelectorProps<C extends Controller<InferStateType<C>>, T> {
  source: Constructor<C> | C
  selector: (state: InferStateType<C>) => T
  children: (value: T) => ReactNode
}

function Selector<C extends Controller<InferStateType<C>>, T>({ source, selector, children }: SelectorProps<C, T>) {
  const controller = useControllerResolver(source)
  const value = useSelector(controller, selector)
  return children(value)
}

export { Selector, SelectorProps }
