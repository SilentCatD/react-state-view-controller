import { ResourcesNotProvidedError, getObjectRuntimeName, useProvider } from 'react-scoped-provider'
import Controller from '../Controller'

type ListenerListenWhen<S> = (prevState: S, currentState: S) => boolean

type InferStateType<C extends Controller<any>> = C extends Controller<infer S> ? S : never

function useListener<C extends Controller<InferStateType<C>>>(
  ctor: new (...a: any) => C,
  listener: (state: InferStateType<C>) => void,
  listenWhen?: ListenerListenWhen<InferStateType<C>>,
): C

function useListener<C extends Controller<InferStateType<C>>>(
  controller: C,
  listener: (state: InferStateType<C>) => void,
  listenWhen?: ListenerListenWhen<InferStateType<C>>,
): void

function useListener<C extends Controller<InferStateType<C>>>(
  source: (new (...a: any) => C) | C,
  listener: (state: InferStateType<C>) => void,
  listenWhen?: ListenerListenWhen<InferStateType<C>>,
): C | undefined {
  const controller = useResolveController(source, { allowUndef: true })
  return controller
}

export { useListener }

interface UseResolveControllerConfigs {
  allowUndef?: boolean
}

function useResolveController<C extends Controller<InferStateType<C>>>(
  source: (new (...a: any) => C) | C,
  configs?: UseResolveControllerConfigs,
): C | undefined {
  const providedController = useProvider(
    source instanceof Controller ? (source.constructor as new (...a: any) => C) : source,
    {
      allowUndef: true,
    },
  )
  const passedController = source instanceof Controller ? source : undefined
  const resolvedController = passedController ?? providedController
  if (resolvedController === undefined) {
    if (configs?.allowUndef === true) {
      return undefined
    }
    throw new ResourcesNotProvidedError(getObjectRuntimeName(source))
  }
  return resolvedController
}

export { useResolveController }
