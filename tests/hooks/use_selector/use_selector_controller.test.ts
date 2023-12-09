import { TestScheduler } from 'rxjs/testing'
import { Controller, useSelector } from '../../../src'
import { tap } from 'rxjs'
import { act, renderHook, waitFor } from '@testing-library/react'

const asyncDelay = (ms: number) => new Promise((r) => setTimeout(r, ms))
type CounterData = {
  counter: number
}

class TestController extends Controller<CounterData> {
  constructor() {
    super({ counter: 0 })
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

it('rerender on state changed', async () => {
  const onRerender = jest.fn((state: number) => state)
  const instance = new TestController()
  const { result } = renderHook(() => {
    const value = useSelector(instance, (state) => state.counter)
    onRerender(value)
    return value
  })
  expect(result.current).toBe(0)
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
    expect(result.current).toBe(5)
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
  const stateCompareFn = jest.fn((prev, curr) => {
    return prev !== curr
  })
  const instance = new TestController()
  const { result } = renderHook(() => {
    return useSelector(
      instance,
      (state) => state.counter,
      (prev, curr) => stateCompareFn(prev, curr),
    )
  })
  expect(result.current).toBe(0)
  await act(async () => {
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
    expect(stateCompareFn).toHaveBeenCalledTimes(4)
    expect(stateCompareFn.mock.calls[0][0]).toBe(0)
    expect(stateCompareFn.mock.calls[0][1]).toBe(1)
    expect(stateCompareFn.mock.calls[1][0]).toBe(0)
    expect(stateCompareFn.mock.calls[1][1]).toBe(2)
    expect(stateCompareFn.mock.calls[2][0]).toBe(0)
    expect(stateCompareFn.mock.calls[2][1]).toBe(3)
    expect(stateCompareFn.mock.calls[3][0]).toBe(0)
    expect(stateCompareFn.mock.calls[3][1]).toBe(4)
    expect(result.current).toBe(0)
  })
})

it('useSelector controller return value', () => {
  const instance = new TestController()
  const { result } = renderHook(() => useSelector(instance, (state) => state.counter))
  expect(result.current).toBe(0)
})
