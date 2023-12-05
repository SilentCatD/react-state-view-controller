import { PropsWithChildren, useEffect, useRef } from 'react'
import { getObjectRuntimeName, isCreate, ProviderScope } from 'react-scoped-provider'
import Controller from '../Controller'
import { Constructor, Create, InferStateType } from '../types'

type ControllerProviderProps<T extends Controller<InferStateType<T>>> = {
  source: Create<T> | T
  ctor?: Constructor<T>
}

function ControllerProvider<T extends Controller<InferStateType<T>>>({
  source,
  children,
  ctor,
}: PropsWithChildren<ControllerProviderProps<T>>) {
  const createdData = useRef(isCreate(source) ? source() : undefined)
  const valueData: T | undefined = isCreate(source) ? undefined : source
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentData = createdData.current
      if (currentData !== undefined) {
        currentData.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const name = getObjectRuntimeName(ctor ?? createdData.current ?? valueData)
  return (
    <ProviderScope name={name} value={createdData.current ?? valueData}>
      {children}
    </ProviderScope>
  )
}

export { ControllerProvider }

export type { ControllerProviderProps }
