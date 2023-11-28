import React from 'react'
import ReactDOM from 'react-dom/client'
import { Controller, createControllerContext, useListener, useSelector } from 'react-state-view-controller'

const MultiCounterContext = createControllerContext<MultiCounterController, MultiCounterState>()

const ButtonsComp = () => {
  const controller = useListener(
    MultiCounterContext,
    () => console.log(`log but not re-render`),
    (_prev, curr) => curr.count < 5,
  )
  console.log('re-render control center')
  return (
    <div>
      <button onClick={() => controller.increaseCounter()}>Count</button>
      <button onClick={() => controller.increaseCounter1()}>Count2</button>
      <button onClick={() => controller.increaseCounter2()}>Count3</button>
      <button onClick={() => controller.calcTotal()}>Total</button>
    </div>
  )
}

type CounterComponentProps = {
  id: string
  stateSelect: (state: MultiCounterState) => number
}
const CounterComponent = (props: CounterComponentProps) => {
  const [value] = useSelector(MultiCounterContext, props.stateSelect)
  console.log(`comp with id ${props.id} re-render`)
  return <h2>{value}</h2>
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  // <React.StrictMode>
  <MultiCounterContext.Provider create={() => new MultiCounterController()}>
    <CounterComponent id='1' stateSelect={(state) => state.count} />
    <CounterComponent id='2' stateSelect={(state) => state.count2} />
    <CounterComponent id='3' stateSelect={(state) => state.count3} />
    <CounterComponent id='total' stateSelect={(state) => state.total} />
    <ButtonsComp />
  </MultiCounterContext.Provider>,
  // {/* </React.trictMode> */}
)

type MultiCounterState = {
  count: number
  count2: number
  count3: number
  total: number
}

class MultiCounterController extends Controller<MultiCounterState> {
  constructor() {
    super({
      count: 0,
      count2: 0,
      count3: 0,
      total: 0,
    })
  }
  increaseCounter() {
    this.emit({ count: this.state.count + 1 })
  }
  increaseCounter1() {
    this.emit({ count2: this.state.count2 + 1 })
  }
  increaseCounter2() {
    this.emit({ count3: this.state.count3 + 1 })
  }
  calcTotal() {
    this.emit({
      total: this.state.count3 + this.state.count2 + this.state.count,
    })
  }
}
