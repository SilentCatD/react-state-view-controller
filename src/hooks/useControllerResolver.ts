import { useContext } from 'react'
import Controller from '../Controller'
import { Constructor, InferStateType } from '../types'
import { ProviderContext, ResourcesNotProvidedError, getObjectRuntimeName } from 'react-scoped-provider'

function useControllerResolver<C extends Controller<InferStateType<C>>>(source: Constructor<C> | C): C {
  const passedInController = source instanceof Controller ? source : undefined
  const contextData = useContext(ProviderContext)
  if (passedInController !== undefined) {
    return passedInController
  }
  const name = getObjectRuntimeName(source)
  if (contextData?.data.has(name) === true) {
    return contextData.data.get(name)
  }

  throw new ResourcesNotProvidedError(name)
}
export { useControllerResolver }
