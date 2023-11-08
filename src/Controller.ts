import { BehaviorSubject } from 'rxjs'
abstract class Controller<T> {
  constructor(initialState: T) {
    this._subject = new BehaviorSubject<T>(initialState)
  }

  private _subject!: BehaviorSubject<T>

  public get observable() {
    return this._subject.asObservable()
  }

  public get state() {
    return this._subject.value
  }

  protected emit(state: T) {
    if (this.state === state) {
      return
    }
    this._subject.next(state)
  }

  public async dispose() {
    this._subject.complete()
  }
}

export default Controller
