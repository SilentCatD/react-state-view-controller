import { TestScheduler } from 'rxjs/testing'
import { Controller, ControllerProvider, useSelector } from '../../../src'
import { act, getByTestId, render, waitFor } from '@testing-library/react'
import { tap } from 'rxjs'

type CounterData = {
  counter: number
}

class TestController extends Controller<CounterData> {
  constructor(initialState?: CounterData) {
    super(initialState ?? { counter: 0 })
  }
  inc() {
    this.emit({ counter: this.state.counter + 1 })
  }
  protected compareState(): boolean {
    return false
  }
  reEmit() {
    this.emit(this.state)
  }
}

it('emit object values every reEmit', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    return expect(actual).toEqual(expected)
  })
  const testController = new TestController()
  const triggerMarbles = '-aaaa'
  const triggerValues = {
    a: () => testController.reEmit(),
  }

  const expectedMarbles = '-aaaa'
  const expectedValues = {
    a: { counter: 0 },
  }
  const eventObservable = testController.observable.pipe()
  testScheduler.run(({ expectObservable, cold }) => {
    expectObservable(eventObservable).toBe(expectedMarbles, expectedValues)
    expectObservable(cold(triggerMarbles, triggerValues).pipe(tap((fn) => fn())))
  })
})

type DisplayRenderedProps = {
  stateComp?: (prev: number, curr: number) => boolean
}
const DisplayRendered = ({ stateComp }: DisplayRenderedProps) => {
  const [state, controller] = useSelector(TestController, (state) => state.counter, stateComp)
  return (
    <>
      <h1 data-testid='text'>{state}</h1>
      <h1 data-testid='controller'>{controller.constructor.name}</h1>
    </>
  )
}

it('rerender on state changed', async () => {
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = '0'
  expect(renderedText).toBe(expectedText)
  act(() => {
    instance.inc()
    instance.inc()
    instance.inc()
    instance.inc()
    instance.inc()
  })
  await waitFor(() => {
    const rendered = getByTestId(container, 'text')
    const renderedText = rendered.textContent
    const expectedText = '5'
    expect(renderedText).toBe(expectedText)
  })
})

it('specified state compare respected', async () => {
  const stateCompareFn = jest.fn((prev, curr) => prev !== curr)
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered stateComp={stateCompareFn} />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = '0'
  expect(renderedText).toBe(expectedText)

  act(() => {
    instance.inc()
    instance.inc()
    instance.inc()
    instance.inc()
  })
  await waitFor(() => {
    expect(stateCompareFn).toHaveBeenCalledTimes(4)
    expect(stateCompareFn.mock.calls[0][0]).toBe(0)
    expect(stateCompareFn.mock.calls[0][1]).toBe(1)
    expect(stateCompareFn.mock.calls[1][0]).toBe(0)
    expect(stateCompareFn.mock.calls[1][1]).toBe(2)
    expect(stateCompareFn.mock.calls[2][0]).toBe(0)
    expect(stateCompareFn.mock.calls[2][1]).toBe(3)
    expect(stateCompareFn.mock.calls[3][0]).toBe(0)
    expect(stateCompareFn.mock.calls[3][1]).toBe(4)
    const rendered = getByTestId(container, 'text')
    const renderedText = rendered.textContent
    const expectedText = '0'
    expect(renderedText).toBe(expectedText)
  })
})

it('useSelector cto return [state, controller]', () => {
  const instance = new TestController({ counter: 5 })
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered />
    </ControllerProvider>,
  )
  const renderedCount = getByTestId(container, 'text')
  const renderedText = renderedCount.textContent
  const expectedText = '5'
  expect(renderedText).toBe(expectedText)

  const renderedController = getByTestId(container, 'controller')
  const renderedControllerText = renderedController.textContent
  const expectedControllerText = 'TestController'
  expect(renderedControllerText).toBe(expectedControllerText)
})
