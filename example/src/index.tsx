import React from 'react'
import ReactDOM from 'react-dom/client'
import { Controller, createControllerContext, useController } from 'react-state-view-controller'

const CounterContext = createControllerContext<CounterController, number>()

const TestComp = () => {
  console.log('re-render-test')
  return <h1>Re-Render-Test</h1>
}

const ButtonComp = () => {
  const controller = useController(CounterContext)
  console.log('re-render-controller')
  return (
    <div>
      <CounterContext.Listener
        listener={(state) => console.log({ state: state })}
        listenWhen={(prev, curr) => curr === 10}
      >
        <button onClick={() => controller.increase()}>Increase</button>
        <button onClick={() => controller.decrease()}>Decrease</button>
      </CounterContext.Listener>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <CounterContext.Provider create={() => new CounterController(10)}>
      <div>
        <TestComp />
        <CounterContext.Builder builder={(state) => <h2>{state}</h2>} />
        <ButtonComp />
      </div>
    </CounterContext.Provider>
  </React.StrictMode>,
)

class CounterController extends Controller<number> {
  constructor(initialValue: number) {
    super(initialValue)
  }
  increase() {
    this.emit(this.state + 1)
  }
  decrease() {
    this.emit(this.state - 1)
  }
}
