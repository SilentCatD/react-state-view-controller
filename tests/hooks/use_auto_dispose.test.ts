import { Controller, useAutoDispose } from '../../src'
import { renderHook } from '@testing-library/react'

class TestController extends Controller<number> {
  constructor() {
    super(0)
  }
}

it('dispose when unmounted', () => {
  const instance = new TestController()
  jest.spyOn(instance, 'dispose')
  const { unmount } = renderHook(() => useAutoDispose(() => instance))
  unmount()
  expect(instance.dispose).toHaveBeenCalledTimes(1)
})

it('create resources', () => {
  const mockCreate = jest.fn()
  mockCreate.mockReturnValueOnce(new TestController())
  const { result } = renderHook(() => useAutoDispose(() => mockCreate()))
  const controller = result.current
  expect(controller).toBeInstanceOf(TestController)
  expect(mockCreate.mock.calls.length).toBe(1)
  jest.restoreAllMocks()
})

it('resouces is the same', () => {
  const instance = new TestController()
  const mockCreate = jest.fn()
  mockCreate.mockReturnValueOnce(instance)
  const { result } = renderHook(() => useAutoDispose(() => mockCreate()))
  const controller = result.current
  expect(controller).toBeInstanceOf(TestController)
  expect(controller).toBe(instance)
  expect(mockCreate.mock.calls.length).toBe(1)
  jest.restoreAllMocks()
})
