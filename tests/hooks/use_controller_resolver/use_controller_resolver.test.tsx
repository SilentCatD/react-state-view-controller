import { getByTestId, render, waitFor } from '@testing-library/react'
import { Constructor, Controller, ControllerProvider, ResourcesNotProvidedError } from '../../../src'
import { useControllerResolver } from '../../../src/'
import { PropsWithChildren } from 'react'

class TestController extends Controller<number> {
  constructor() {
    super(5)
  }
}

const ProviderComponent = ({ children }: PropsWithChildren) => {
  return <ControllerProvider source={() => new TestController()}>{children}</ControllerProvider>
}

type ConsumerProps = {
  source: Constructor<TestController> | TestController
}
const ComsumerComponent = ({ source }: ConsumerProps) => {
  const controller = useControllerResolver(source)
  return <h1 data-testid='number'>{controller.state}</h1>
}

it('can get provided data with ctor', () => {
  const { container } = render(
    <ProviderComponent>
      <ComsumerComponent source={TestController} />
    </ProviderComponent>,
  )
  const renderedNumberElement = getByTestId(container, 'number')
  const renderedNumber = renderedNumberElement.textContent
  const expectedNumber = '5'
  expect(renderedNumber).toBe(expectedNumber)
})

it('can get provided data with instance', () => {
  const testController = new TestController()
  const { container } = render(<ComsumerComponent source={testController} />)
  const renderedNumberElement = getByTestId(container, 'number')
  const renderedNumber = renderedNumberElement.textContent
  const expectedNumber = '5'
  expect(renderedNumber).toBe(expectedNumber)
})

it('throw error when not provided ctor', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => jest.fn())

  const renderer = () => {
    render(<ComsumerComponent source={TestController} />)
  }
  await waitFor(() => expect(renderer).toThrow(ResourcesNotProvidedError))
  jest.restoreAllMocks()
})
