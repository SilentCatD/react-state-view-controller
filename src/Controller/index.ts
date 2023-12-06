import { Observable, Subject } from 'rxjs'
import { isEqual } from '../utils'
abstract class Controller<T> {
  constructor(initialState: T) {
    this._state = initialState
    this._subject = new Subject<T>()
  }

  private _state: T
  private _subject: Subject<T>

  public get observable(): Observable<T> {
    return this._subject.asObservable()
  }

  public get state(): T {
    return this._state
  }

  protected compareState(previous: T, current: T): boolean {
    // return true when equal
    return isEqual(previous, current)
  }

  protected emit(state: Partial<T>): void {
    const newState: T = { ...this._state, ...state }
    if (this.compareState(this._state, newState)) {
      return
    }
    this._state = newState
    this._subject.next(this._state)
  }

  public async dispose(): Promise<void> {
    this._subject.complete()
  }
}

export default Controller
