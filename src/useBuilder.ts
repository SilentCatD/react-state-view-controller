import { useState } from 'react'
import Controller from './Controller'
import { BuilderBuildWhen, ControllerContext } from './types'
import { useControllerInternal } from './useController'
import { useListener } from './useListener'
function useBuilder<C extends Controller<S>, S>(
  context: ControllerContext<C, S>,
  buildWhen?: BuilderBuildWhen<S>,
): [S, C]
function useBuilder<C extends Controller<S>, S>(controller: C, buildWhen?: BuilderBuildWhen<S>): S

function useBuilder<C extends Controller<S>, S>(
  source: ControllerContext<C, S> | C,
  buildWhen?: BuilderBuildWhen<S>,
): [S, C] {
  const controller = useControllerInternal(source) as C
  const [state, setState] = useState(() => controller.state)
  useListener<C, S>(
    controller,
    (newState) => setState(newState),
    (prev, curr) => buildWhen?.(prev, curr) ?? true,
  )
  return [state, controller]
}

export { useBuilder }
