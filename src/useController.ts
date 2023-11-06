import { useContext } from 'react'
import Controller from './Controller'
import { ControllerContext } from './types'

function useController<C extends Controller<S>, S>(context: ControllerContext<C, S>): C {
  const controller = useContext(context._context)
  if (controller === undefined) {
    throw new Error('Not Provided') // later alternative with class
  }
  return controller
}
export { useController }
