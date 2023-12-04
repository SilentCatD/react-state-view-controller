import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { MultiProvider, Provider, useNamedProvider, useProvider } from 'react-scoped-provider'

class Counter {
  count: number
  constructor(count: number) {
    this.count = count
  }
}

type CustomData = {
  field: number
  field2: string
}

const Consumer = () => {
  const count = useProvider(Number)
  const text = useProvider(String)
  const truth = useProvider(Boolean)
  const counter = useProvider(Counter)
  const customData = useNamedProvider<CustomData>('customData')
  return (
    <div>
      <h2 data-testid='counter-value'>This should update on btn clicked: {count}</h2>
      <h2 data-testid='string'>Provided String: {text}</h2>
      <h2 data-testid='boolean'>Provided Boolean: {truth ? 'true' : 'false'}</h2>
      <h2 data-testid='counter-create'>This should NOT update on btn clicked: {counter.count}</h2>
      <h2 data-testid='custom-data'>
        Custom data: {customData.field}-{customData.field2}
      </h2>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const customData: CustomData = {
    field: 3,
    field2: 'hello',
  }
  return (
    <MultiProvider
      providers={[
        <Provider source={count} />,
        <Provider source={'test-string'} />,
        <Provider source={true} />,
        <Provider source={() => new Counter(count + 1)} />,
        <Provider source={customData} name='customData' />,
      ]}
    >
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
            Learn React
          </a>
          <button className='App-button' data-testid='btn' onClick={() => setCount((value) => value + 1)}>
            Inc
          </button>
          <Consumer />
        </header>
      </div>
    </MultiProvider>
  )
}

export default App
