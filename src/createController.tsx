import Controller from './Controller'
import { ControllerCreator, LinkedController } from './types'
import merge from 'lodash.merge'

function createController<C, S>(
  initialState: S,
  create: ControllerCreator<C, S>,
  dispose?: () => Promise<void>,
): LinkedController<C, S> {
  class MergingController extends Controller<S> {
    constructor() {
      super(initialState)
      this.controller = create(() => this.state, this.emit.bind(this))
    }
    controller: C

    public async dispose(): Promise<void> {
      await super.dispose()
      await dispose?.()
    }
  }
  const merging = new MergingController()
  const result = merge(merging, merging.controller)

  return result
}

export { createController }
