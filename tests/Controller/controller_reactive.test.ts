import { TestScheduler } from 'rxjs/testing'
import { Controller } from '../../src'
import { tap } from 'rxjs'

class TestCounterController extends Controller<number> {
  constructor() {
    super(0)
  }

  inc() {
    this.emit(this.state + 1)
  }
  dec() {
    this.emit(this.state - 1)
  }
}

let testScheduler: TestScheduler
beforeEach(() => {
  testScheduler = new TestScheduler((actual, expected) => {
    return expect(actual).toEqual(expected)
  })
})

it('dispose', () => {
  const testController = new TestCounterController()

  const triggerMarbles = '-a'
  const triggerValues = {
    a: () => testController.dispose(),
  }

  const expectedMarbles = '-|'
  const eventObservable = testController.observable.pipe()
  testScheduler.run(({ expectObservable, cold }) => {
    expectObservable(eventObservable).toBe(expectedMarbles, undefined)
    expectObservable(cold(triggerMarbles, triggerValues).pipe(tap((fn) => fn())))
  })
})

it('emit object values then dispose', () => {
  const testController = new TestCounterController()
  const triggerMarbles = '-ababb-c'
  const triggerValues = {
    a: () => testController.inc(),
    b: () => testController.dec(),
    c: () => testController.dispose(),
  }

  const expectedMarbles = '-ababc-|'
  const expectedValues = {
    a: 1,
    b: 0,
    c: -1,
  }
  const eventObservable = testController.observable.pipe()
  testScheduler.run(({ expectObservable, cold }) => {
    expectObservable(eventObservable).toBe(expectedMarbles, expectedValues)
    expectObservable(cold(triggerMarbles, triggerValues).pipe(tap((fn) => fn())))
  })
})

type Test2State = {
  count: number
}

class TestCounterController2 extends Controller<Test2State> {
  constructor() {
    super({ count: 0 })
  }
  inc() {
    this.emit({ count: this.state.count + 1 })
  }
  dec() {
    this.emit({ count: this.state.count - 1 })
  }
}

it('emit primitive values then dispose', () => {
  const testController = new TestCounterController2()
  const triggerMarbles = '-ababb-c'
  const triggerValues = {
    a: () => testController.inc(),
    b: () => testController.dec(),
    c: () => testController.dispose(),
  }

  const expectedMarbles = '-ababc-|'
  const expectedValues = {
    a: { count: 1 },
    b: { count: 0 },
    c: { count: -1 },
  }
  const eventObservable = testController.observable.pipe()
  testScheduler.run(({ expectObservable, cold }) => {
    expectObservable(eventObservable).toBe(expectedMarbles, expectedValues)
    expectObservable(cold(triggerMarbles, triggerValues).pipe(tap((fn) => fn())))
  })
})
