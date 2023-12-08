import { TestScheduler } from 'rxjs/testing'
import { Controller, useBuilder } from '../../../src'
import { tap } from 'rxjs'
import { act, renderHook, waitFor } from '@testing-library/react'

class TestController extends Controller<number> {
  constructor() {
    super(0)
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

it('buildWhen respected', (done) => {
  const buildWhenFn = jest.fn((prev, curr) => prev === curr)
  const instance = new TestController()
  const { result } = renderHook(() => useBuilder(instance, buildWhenFn))
  instance.inc()
  instance.inc()
  instance.inc()
  instance.inc()
  instance.inc()
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
  expect(result.current).toBe(0)
  done()
})

it('rerender on state changed', async () => {
  const instance = new TestController()
  const { result } = renderHook(() => {
    return useBuilder(instance)
  })
  expect(result.current).toBe(0)
  act(() => {
    instance.inc()
    instance.inc()
    instance.inc()
    instance.inc()
    instance.inc()
  })
  await waitFor(() => expect(result.current).toBe(5))
})

it('specified state compare respected', async () => {
  const stateCompareFn = jest.fn((prev, curr) => prev !== curr)
  const instance = new TestController()
  const { result } = renderHook(() => {
    return useBuilder(
      instance,
      () => true,
      (prev, curr) => stateCompareFn(prev, curr),
    )
  })
  expect(result.current).toBe(0)
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
    expect(result.current).toBe(0)
  })
})

it('useBuilder controller return state', () => {
  const instance = new TestController()
  const { result } = renderHook(() => useBuilder(instance))
  expect(result.current).toBe(0)
})
