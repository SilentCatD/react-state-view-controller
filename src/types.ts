import Controller from './Controller'

type Create<T> = () => T

// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T> = Function & { prototype: T }

type InferStateType<C extends Controller<any>> = C extends Controller<infer S> ? S : never

type ShouldUpdate<S> = (prevState: S, currentState: S) => boolean

type StateCompare<S> = (prevState: S, currentState: S) => boolean

export type { Create, Constructor, InferStateType, ShouldUpdate, StateCompare }
