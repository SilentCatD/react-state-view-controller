import { useEffect, useRef } from 'react'
import Controller from '../Controller'
import { Create, InferStateType } from '../types'

function useAutoDispose<C extends Controller<InferStateType<C>>>(create: Create<C>): C {
  const controllerRef = useRef(create())
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const controller = controllerRef.current
      controller.dispose()
    }
  }, [])
  return controllerRef.current
}

export { useAutoDispose }
