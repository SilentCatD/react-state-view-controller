import { Controller } from '../../src'

type TestState = {
  count: number
  count2: number
  count3: number
  count4: number
}

class TestController extends Controller<TestState> {
  constructor(initialState: TestState) {
    super(initialState)
  }

  incCount() {
    this.emit({ count: this.state.count + 1 })
  }
  incCount2() {
    this.emit({ count2: this.state.count2 + 1 })
  }
  incCount3() {
    this.emit({ count3: this.state.count3 + 1 })
  }
  incCount4() {
    this.emit({ count4: this.state.count4 + 1 })
  }

  emitState(state: TestState) {
    this.emit(state)
  }
}

it('initialState respected', () => {
  const initialState: TestState = {
    count: 1,
    count2: 2,
    count3: 3,
    count4: 4,
  }
  const testController = new TestController(initialState)
  const state = testController.state
  expect(state.count).toBe(1)
  expect(state.count2).toBe(2)
  expect(state.count3).toBe(3)
  expect(state.count4).toBe(4)
})

it('state update sync', () => {
  const initialState: TestState = {
    count: 1,
    count2: 2,
    count3: 3,
    count4: 4,
  }
  const testController = new TestController(initialState)
  testController.incCount()
  expect(testController.state.count).toBe(2)

  testController.incCount2()
  expect(testController.state.count2).toBe(3)

  testController.incCount3()
  expect(testController.state.count3).toBe(4)

  testController.incCount4()
  expect(testController.state.count4).toBe(5)
})

it('state is not-change/skipped when the same value emitted', () => {
  const initialState: TestState = {
    count: 1,
    count2: 2,
    count3: 3,
    count4: 4,
  }
  const testController = new TestController(initialState)
  const oldState = testController.state
  testController.emitState({
    count: 1,
    count2: 2,
    count3: 3,
    count4: 4,
  })
  const newState = testController.state

  expect(oldState).toBe(newState)
})
