import { getByTestId, render } from '@testing-library/react'
import { Controller, ControllerProvider, useProvider } from '../../src'

class TestController extends Controller<number> {
  constructor() {
    super(0)
  }
}

class TestControllerSub extends TestController {}
class TestControllerSub2 extends TestController {}

const DisplayRendered = () => {
  useProvider(TestController)
  return <h1 data-testid='text'>Rendered</h1>
}

it('render provided value without error', () => {
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider source={instance}>
      <DisplayRendered />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered'
  expect(renderedText).toBe(expectedText)
})

it('render provided value ctor without error', () => {
  const instance = new TestControllerSub()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered'
  expect(renderedText).toBe(expectedText)
})

it('render provided create without error', () => {
  const { container } = render(
    <ControllerProvider source={() => new TestController()}>
      <DisplayRendered />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered'
  expect(renderedText).toBe(expectedText)
})

it('render provided create ctor without error', () => {
  const { container } = render(
    <ControllerProvider ctor={TestController} source={() => new TestControllerSub2()}>
      <DisplayRendered />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered'
  expect(renderedText).toBe(expectedText)
})
