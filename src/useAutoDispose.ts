import { useEffect, useRef } from 'react'
import Controller from './Controller'

function useAutoDispose<C extends Controller<S>, S>(create: () => C): C {
  const controllerRef = useRef(create())
  useEffect(() => {
    const controller = controllerRef.current
    return () => {
      controller.dispose()
    }
  }, [])
  return controllerRef.current
}

export { useAutoDispose }
