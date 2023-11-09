import { useState } from 'react'
import Controller from './Controller'
import { BuilderBuildWhen, ControllerContext } from './types'
import { useController } from './useController'
import { useListener } from './useListener'

function useBuilder<C extends Controller<S>, S>(
  context: ControllerContext<C, S>,
  buildWhen: BuilderBuildWhen<S> = () => true,
): [S, C] {
  const controller = useController(context) as C
  const [state, setState] = useState(() => controller.state)
  useListener(
    context,
    (newState) => setState(newState),
    (prev, curr) => buildWhen(prev, curr),
  )
  return [state, controller]
}

export { useBuilder }
