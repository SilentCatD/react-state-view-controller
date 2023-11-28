import { useContext } from 'react'
import Controller from './Controller'
import { ControllerContext } from './types'
import { ControllerNotProvided } from './error'

function useController<C extends Controller<S>, S>(context: ControllerContext<C, S>): C {
  return useControllerInternal(context)
}
function useControllerInternal<C extends Controller<S>, S>(source: ControllerContext<C, S> | C): C {
  try {
    const controller = useContext((source as ControllerContext<C, S>)._context)
    if (controller === undefined) {
      throw new ControllerNotProvided(
        "The requested controller is not provided in scope, make sure you have wrap it's Provider",
      )
    }
    return controller
  } catch (err) {
    if (err instanceof ControllerNotProvided) {
      throw err
    }
    return source as C
  }
}
export { useController, useControllerInternal }
