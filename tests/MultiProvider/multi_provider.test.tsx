// able to render without error
// able to render all providers

import { getByTestId, render } from '@testing-library/react'
import { Controller, ControllerProvider, MultiProvider, useProvider } from '../../src'

class TestController extends Controller<number> {
  constructor() {
    super(0)
  }
}

class TestController2 extends Controller<number> {
  constructor() {
    super(1)
  }
}
class TestController3 extends Controller<number> {
  constructor() {
    super(2)
  }
}
const App = () => {
  const testController = useProvider(TestController)
  const testController2 = useProvider(TestController2)
  const testController3 = useProvider(TestController3)
  return (
    <>
      <h1 data-testid='app-text1'>{testController.state}</h1>
      <h1 data-testid='app-text2'>{testController2.state}</h1>
      <h1 data-testid='app-text3'>{testController3.state}</h1>
    </>
  )
}

it('render 4 level nested, all level child rendered', () => {
  const { container } = render(
    <MultiProvider
      providers={[
        <ControllerProvider key={0} source={() => new TestController()} />,
        <ControllerProvider key={1} source={() => new TestController2()} />,
        <ControllerProvider key={2} source={() => new TestController3()} />,
      ]}
    >
      <App />
    </MultiProvider>,
  )

  const appTextElement1 = getByTestId(container, 'app-text1')
  const appText1 = appTextElement1.textContent
  const expectedAppText1 = '0'
  expect(appText1).toBe(expectedAppText1)

  const appTextElement2 = getByTestId(container, 'app-text2')
  const appText2 = appTextElement2.textContent
  const expectedAppText2 = '1'
  expect(appText2).toBe(expectedAppText2)

  const appTextElement3 = getByTestId(container, 'app-text3')
  const appText3 = appTextElement3.textContent
  const expectedAppText3 = '2'
  expect(appText3).toBe(expectedAppText3)
})
