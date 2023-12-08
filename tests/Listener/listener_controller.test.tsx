import { TestScheduler } from 'rxjs/testing'
import { Controller, Listener } from '../../src'
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
  source: TestController
  callback: (state: number) => void
  listenWhen?: (prev: number, curr: number) => boolean
  stateComp?: (prev: number, curr: number) => boolean
}
const DisplayRendered = ({ source, callback, listenWhen, stateComp }: DisplayRenderedProps) => {
  return (
    <Listener source={source} listener={callback} listenWhen={listenWhen} stateCompare={stateComp}>
      <h1 data-testid='text'>Rendered</h1>
    </Listener>
  )
}

it('listenWhen respected', (done) => {
  const callbackFn = jest.fn((state) => state)
  const listenWhenFn = jest.fn((prev, curr) => prev === curr)
  const instance = new TestController()
  const { container } = render(<DisplayRendered source={instance} callback={callbackFn} listenWhen={listenWhenFn} />)
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
  const { container } = render(<DisplayRendered source={instance} callback={callbackFn} />)
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
  const { container } = render(<DisplayRendered source={instance} callback={callbackFn} />)
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
    <DisplayRendered source={instance} callback={callbackFn} listenWhen={() => true} stateComp={() => false} />,
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

type DisplayRenderedProvidedProps = {
  source: TestController
}

const DisplayRenderedProvided = ({ source }: DisplayRenderedProvidedProps) => {
  return (
    <Listener source={source} listener={() => {}}>
      <h1 data-testid='text'>Rendered: {source.state}</h1>
    </Listener>
  )
}

it('ctor useListener return controller', () => {
  const instance = new TestController(5)
  const { container } = render(<DisplayRenderedProvided source={instance} />)
  const rendered = getByTestId(container, 'text')
  const renderedText = rendered.textContent
  const expectedText = 'Rendered: 5'
  expect(renderedText).toBe(expectedText)
})
