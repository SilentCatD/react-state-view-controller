import { TestScheduler } from 'rxjs/testing'
import { Controller, ControllerProvider, useListener } from '../../../src'
import { getByTestId, render } from '@testing-library/react'
import { tap } from 'rxjs'

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
  callback: (state: number) => void
  listenWhen?: (prev: number, curr: number) => boolean
  stateComp?: (prev: number, curr: number) => boolean
}
const DisplayRendered = ({ callback, listenWhen, stateComp }: DisplayRenderedProps) => {
  useListener(TestController, callback, listenWhen, stateComp)
  return <h1 data-testid='text'>Rendered</h1>
}

it('listenWhen respected', (done) => {
  const callbackFn = jest.fn((state) => state)
  const listenWhenFn = jest.fn((prev, curr) => prev === curr)
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered callback={callbackFn} listenWhen={listenWhenFn} />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered'
  expect(renderedText).toBe(expectedText)
  instance.inc()
  instance.inc()
  instance.inc()
  instance.inc()
  instance.inc()
  expect(callbackFn).toHaveBeenCalledTimes(0)
  expect(listenWhenFn).toHaveBeenCalledTimes(5)
  expect(listenWhenFn.mock.calls[0][0]).toBe(0)
  expect(listenWhenFn.mock.calls[0][1]).toBe(1)
  expect(listenWhenFn.mock.calls[1][0]).toBe(1)
  expect(listenWhenFn.mock.calls[1][1]).toBe(2)
  expect(listenWhenFn.mock.calls[2][0]).toBe(2)
  expect(listenWhenFn.mock.calls[2][1]).toBe(3)
  expect(listenWhenFn.mock.calls[3][0]).toBe(3)
  expect(listenWhenFn.mock.calls[3][1]).toBe(4)
  expect(listenWhenFn.mock.calls[4][0]).toBe(4)
  expect(listenWhenFn.mock.calls[4][1]).toBe(5)
  done()
})

it('listener called', (done) => {
  const callbackFn = jest.fn((x: number) => x)
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered callback={callbackFn} />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered'
  expect(renderedText).toBe(expectedText)
  instance.inc()
  instance.inc()
  instance.inc()
  instance.inc()
  instance.inc()
  expect(callbackFn).toHaveBeenCalledTimes(5)
  expect(callbackFn.mock.calls[0][0]).toBe(1)
  expect(callbackFn.mock.calls[1][0]).toBe(2)
  expect(callbackFn.mock.calls[2][0]).toBe(3)
  expect(callbackFn.mock.calls[3][0]).toBe(4)
  expect(callbackFn.mock.calls[4][0]).toBe(5)
  done()
})

it('default state compare respected', (done) => {
  const callbackFn = jest.fn((x: number) => x)
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered callback={callbackFn} />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered'
  expect(renderedText).toBe(expectedText)
  instance.inc()
  instance.reEmit()
  instance.reEmit()
  instance.reEmit()
  instance.reEmit()
  instance.reEmit()
  expect(callbackFn).toHaveBeenCalledTimes(1)
  expect(callbackFn.mock.calls[0][0]).toBe(1)
  done()
})

it('specified state compare respected', (done) => {
  const callbackFn = jest.fn((x: number) => x)
  const instance = new TestController()
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRendered callback={callbackFn} listenWhen={() => true} stateComp={() => false} />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered'
  expect(renderedText).toBe(expectedText)
  instance.inc()
  instance.reEmit()
  instance.reEmit()
  instance.reEmit()
  instance.reEmit()
  instance.reEmit()
  expect(callbackFn).toHaveBeenCalledTimes(6)
  expect(callbackFn.mock.calls[0][0]).toBe(1)
  expect(callbackFn.mock.calls[0][0]).toBe(1)
  expect(callbackFn.mock.calls[1][0]).toBe(1)
  expect(callbackFn.mock.calls[2][0]).toBe(1)
  expect(callbackFn.mock.calls[3][0]).toBe(1)
  expect(callbackFn.mock.calls[4][0]).toBe(1)
  done()
})

const DisplayRenderedProvided = () => {
  const controller = useListener(TestController, () => {})
  return <h1 data-testid='text'>Rendered: {controller.state}</h1>
}

it('ctor useListener return controller', () => {
  const instance = new TestController(5)
  const { container } = render(
    <ControllerProvider ctor={TestController} source={instance}>
      <DisplayRenderedProvided />
    </ControllerProvider>,
  )
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered: 5'
  expect(renderedText).toBe(expectedText)
})
