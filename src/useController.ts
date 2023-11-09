import { useContext } from 'react'
import Controller from './Controller'
import { ControllerContext } from './types'
import { ControllerNotProvided } from './error'

function useController<C extends Controller<S>, S>(context: ControllerContext<C, S>): C {
  const controller = useContext(context._context)
  if (controller === undefined) {
    throw new ControllerNotProvided(
      "The requested controller is not provided in scope, make sure you have wrap it's Provider",
    )
  }
  return controller
}
export { useController }
