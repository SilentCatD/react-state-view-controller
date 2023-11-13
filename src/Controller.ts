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

  public get state() {
    return this._state
  }

  protected emit(state: T) {
    if (this._state === state) {
      return
    }
    this._state = state
    this._subject.next(state)
  }

  public async dispose() {
    this._subject.complete()
  }
}

export default Controller
