import Controller from './Controller'
import { Subscription, SubscriptionLike, TeardownLogic, Unsubscribable, Observable } from 'rxjs'
import { Create } from './types'
import { useAutoDispose } from './hooks/useAutoDispose'
import { ControllerProvider, ControllerProviderProps } from './ControllerProvider'
import { MultiProvider, ReceivableElement, MultiProviderProps, useProvider } from 'react-scoped-provider'
import { useListener } from './hooks/useListener'

export { useListener }
export { MultiProvider, ReceivableElement, MultiProviderProps }
export { ControllerProvider, ControllerProviderProps }
export { Create }
export { Controller }
export { Subscription, SubscriptionLike, TeardownLogic, Unsubscribable, Observable }
export { useAutoDispose }

class TestController extends Controller<number> {
  constructor() {
    super(5)
  }
}

const useTest = () => {
  const test = new TestController()
  const a = useListener(TestController, (state) => console.log(state))
}
