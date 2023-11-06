import { BehaviorSubject } from 'rxjs'
abstract class Controller<T> {
  constructor(initialState: T) {
    this._subject = new BehaviorSubject<T>(initialState)
  }

  _subject!: BehaviorSubject<T>

  public get subject() {
    return this._subject
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

  public async dispose() {}
}

export default Controller
