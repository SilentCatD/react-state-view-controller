import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import {
  Controller,
  ControllerProvider,
  useBuilder,
  useListener,
  useProvider,
  useSelector,
} from 'react-state-view-controller'

type MultiCounterState = {
  count: number
  count2: number
}

class MultiCounterController extends Controller<MultiCounterState> {
  constructor() {
    super({ count: 0, count2: 0 })
  }

  inc() {
    this.emit({ count: this.state.count + 1 })
  }
  inc2() {
    this.emit({ count2: this.state.count2 + 1 })
  }
}

const ControllerConsumer = () => {
  const controller = useProvider(MultiCounterController)
  return <h2 data-testid='controller-consumer'>{controller !== undefined ? 'Controller existed!' : ''}</h2>
}

const ListenerConsumer = () => {
  const controller = useListener(MultiCounterController, (state) => {})
  console.log('render listner')
  return <h2 data-testid='controller-listener'>Listenner mounted</h2>
}

const CounterConsumer = () => {
  const [state, controller] = useBuilder(MultiCounterController)
  console.log('render builder')
  return (
    <div>
      <h2 data-testid='counter-text'>Counter: {state.count}</h2>
      <button onClick={() => controller.inc()} data-testid='counter-btn'>
        Inc counter
      </button>
    </div>
  )
}

const Counter2Consumer = () => {
  const [state, controller] = useSelector(MultiCounterController, (state) => state.count2)
  console.log('render-selector')
  return (
    <div>
      <h2 data-testid='counter2-text'>Counter2: {state}</h2>
      <button onClick={() => controller.inc2()} data-testid='counter2-btn'>
        Inc counter2
      </button>
    </div>
  )
}

function App() {
  return (
    <ControllerProvider source={() => new MultiCounterController()}>
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
            Learn React
          </a>
          <ControllerConsumer />
          <ListenerConsumer />
          <CounterConsumer />
          <Counter2Consumer />
        </header>
      </div>
    </ControllerProvider>
  )
}

export default App
