import { isEquals } from './utils'
import { Subject } from 'rxjs'
abstract class Controller<T> {
  constructor(initialState: T) {
    this._state = initialState
    this._subject = new Subject<T>()
  }

  private _state: T
  private _subject: Subject<T>

  public get observable() {
    return this._subject.asObservable()
  }

  public get state(): T {
    return this._state
  }

  protected emit(state: Partial<T>) {
    const newState: T = { ...this._state, state }
    if (isEquals(newState, this._state)) {
      return
    }
    this._state = newState
    this._subject.next(this._state)
  }

  public async dispose() {
    this._subject.complete()
  }
}

export default Controller
