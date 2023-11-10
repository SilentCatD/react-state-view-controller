import Controller from './Controller'
import { ControllerCreator, LinkedController } from './types'

function createController<C, S>(initialState: S, create: ControllerCreator<C, S>): LinkedController<C, S> {
  class mergingController extends Controller<S> {
    constructor() {
      super(initialState)
    }
    public emitState(state: S) {
      this.emit(state)
    }
  }
  const merging = new mergingController()
  const controller = create(merging.emitState, () => merging.state)
  return Object.assign({}, merging, controller)
}

export { createController }
