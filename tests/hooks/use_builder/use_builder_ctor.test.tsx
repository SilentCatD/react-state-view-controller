import { TestScheduler } from 'rxjs/testing'
import { Controller, ControllerProvider, ResourcesNotProvidedError, useBuilder } from '../../../src'
import { act, getByTestId, render, waitFor } from '@testing-library/react'
import { tap } from 'rxjs'

const asyncDelay = (ms: number) => new Promise((r) => setTimeout(r, ms))

class TestController extends Controller<number> {
  constructor(initialValue?: number) {
    super(initialValue ?? 0)
  }
  inc() {
    this.emit(this.state + 1)
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
    a: 0,
  }
  const eventObservable = testController.observable.pipe()
  testScheduler.run(({ expectObservable, cold }) => {
    expectObservable(eventObservable).toBe(expectedMarbles, expectedValues)
    expectObservable(cold(triggerMarbles, triggerValues).pipe(tap((fn) => fn())))
  })
})

type DisplayRenderedProps = {
  buildWhen?: (prev: number, curr: number) => boolean
  stateComp?: (prev: number, curr: number) => boolean
  callback?: (state: number) => void
}
const DisplayRendered = ({ buildWhen, stateComp, callback }: DisplayRenderedProps) => {
  const [state, controller] = useBuilder(TestController, buildWhen, stateComp)
  callback?.(state)
  return (
    <>
      <h1 data-testid='text'>{state}</h1>
      <h1 data-testid='controller'>{controller.constructor.name}</h1>
    </>
  )
}

it('buildWhen respected', async () => {
  const buildWhenFn = jest.fn((prev, curr) => prev === curr)
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered buildWhen={buildWhenFn} />
    </ControllerProvider>,
  )
  await act(async () => {
    await asyncDelay(500)
    instance.inc()
    await asyncDelay(500)
    instance.inc()
    await asyncDelay(500)
    instance.inc()
    await asyncDelay(500)
    instance.inc()
    await asyncDelay(500)
    instance.inc()
  })

  await waitFor(() => {
    expect(buildWhenFn).toHaveBeenCalledTimes(5)
    expect(buildWhenFn.mock.calls[0][0]).toBe(0)
    expect(buildWhenFn.mock.calls[0][1]).toBe(1)
    expect(buildWhenFn.mock.calls[1][0]).toBe(1)
    expect(buildWhenFn.mock.calls[1][1]).toBe(2)
    expect(buildWhenFn.mock.calls[2][0]).toBe(2)
    expect(buildWhenFn.mock.calls[2][1]).toBe(3)
    expect(buildWhenFn.mock.calls[3][0]).toBe(3)
    expect(buildWhenFn.mock.calls[3][1]).toBe(4)
    expect(buildWhenFn.mock.calls[4][0]).toBe(4)
    expect(buildWhenFn.mock.calls[4][1]).toBe(5)
    const rendered = getByTestId(container, 'text')
    const renderedText = rendered.textContent
    const expectedText = '0'
    expect(renderedText).toBe(expectedText)
  })
})

it('rerender on state changed', async () => {
  const onRerender = jest.fn((state: number) => state)
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered callback={onRerender} />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = '0'
  expect(renderedText).toBe(expectedText)
  await act(async () => {
    await asyncDelay(500)
    instance.inc()
    await asyncDelay(500)
    instance.inc()
    await asyncDelay(500)
    instance.inc()
    await asyncDelay(500)
    instance.inc()
    await asyncDelay(500)
    instance.inc()
  })
  await waitFor(() => {
    const rendered = getByTestId(container, 'text')
    const renderedText = rendered.textContent
    const expectedText = '5'
    expect(renderedText).toBe(expectedText)
    expect(onRerender).toHaveBeenCalledTimes(6)
    expect(onRerender.mock.calls[0][0]).toBe(0)
    expect(onRerender.mock.calls[1][0]).toBe(1)
    expect(onRerender.mock.calls[2][0]).toBe(2)
    expect(onRerender.mock.calls[3][0]).toBe(3)
    expect(onRerender.mock.calls[4][0]).toBe(4)
    expect(onRerender.mock.calls[5][0]).toBe(5)
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

  await act(async () => {
    asyncDelay(500)
    instance.inc()
    asyncDelay(500)
    instance.inc()
    asyncDelay(500)
    instance.inc()
    asyncDelay(500)
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

it('useBuilder cto return [state, controller]', () => {
  const instance = new TestController(5)
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

it('throw error when not provided ctor', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => jest.fn())

  const renderer = () => {
    render(<DisplayRendered />)
  }
  await waitFor(() => expect(renderer).toThrow(ResourcesNotProvidedError))
  jest.restoreAllMocks()
})
