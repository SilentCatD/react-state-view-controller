import React, { PropsWithChildren } from 'react'
import ReactDOM from 'react-dom/client'
import { Controller, createControllerContext, useController, Subscription, Nested } from 'react-state-view-controller'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

const CounterContext = createControllerContext<CounterController, CounterState>()
const CounterContext2 = createControllerContext<CounterController2, CounterState>()
const CounterContext3 = createControllerContext<CounterController3, CounterState>()

const Counters = () => {
  return (
    <div>
      <CounterContext.Builder builder={(state) => <h2>{state.count}</h2>} />
      <CounterContext2.Builder builder={(state) => <h2>{state.count}</h2>} />
      <CounterContext3.Builder builder={(state) => <h2>{state.count}</h2>} />
    </div>
  )
}
const Buttons = () => {
  const counterController = useController(CounterContext)
  return <button onClick={() => counterController.increaseCounter()}>Increase Counter</button>
}

const Counter2Provider: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const controller = useController(CounterContext)
  return (
    <CounterContext2.Provider create={() => new CounterController2(controller)}>{children}</CounterContext2.Provider>
  )
}
const Counter3Provider: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const controller = useController(CounterContext2)
  return (
    <CounterContext3.Provider create={() => new CounterController3(controller)}>{children}</CounterContext3.Provider>
  )
}

root.render(
  // <CounterContext.Provider create={() => new CounterController({ count: 0 })}>
  //   <Counter2Provider>
  //     <Counter3Provider>
  //       <Counters />
  //       <Buttons />
  //     </Counter3Provider>
  //   </Counter2Provider>
  // </CounterContext.Provider>,
  <Nested
    elements={[
      <CounterContext.Provider key={0} create={() => new CounterController({ count: 0 })} />,
      <Counter2Provider key={1} />,
      <Counter3Provider key={2} />,
    ]}
  >
    <Counters />
    <Buttons />
  </Nested>,
)

type CounterState = {
  count: number
}

class CounterController extends Controller<CounterState> {
  constructor(initialState: CounterState) {
    super(initialState)
  }
  increaseCounter = () => {
    this.emit({ count: this.state.count + 1 })
  }
}

class CounterController2 extends Controller<CounterState> {
  constructor(controller: CounterController) {
    super(controller.state)
    this.subs = controller.observable.subscribe(this.onNewState)
  }
  subs: Subscription

  onNewState = (state: CounterState) => {
    this.emit({ count: state.count + 1 })
  }

  dispose(): Promise<void> {
    this.subs.unsubscribe()
    return Promise.resolve()
  }
}

class CounterController3 extends Controller<CounterState> {
  constructor(controller: CounterController2) {
    super(controller.state)
    this.subs = controller.observable.subscribe(this.onNewState)
  }
  subs: Subscription

  onNewState = (state: CounterState) => {
    this.emit({ count: state.count + 1 })
  }

  dispose(): Promise<void> {
    this.subs.unsubscribe()
    return Promise.resolve()
  }
}
