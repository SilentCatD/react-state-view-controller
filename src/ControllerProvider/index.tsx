import { PropsWithChildren } from 'react'
import { Provider, isCreate } from 'react-scoped-provider'
import Controller from '../Controller'
import { Create } from '../types'

type ControllerProviderProps<T extends Controller<unknown>> = {
  source: Create<T> | T
}

function ControllerProvider<T extends Controller<unknown>>({
  source,
  children,
}: PropsWithChildren<ControllerProviderProps<T>>) {
  return (
    <Provider
      source={source}
      cleanUp={(controller) => {
        if (isCreate(source)) {
          controller.dispose()
        }
      }}
    >
      {children}
    </Provider>
  )
}

export { ControllerProvider }

export type { ControllerProviderProps }
