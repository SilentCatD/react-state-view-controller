import { PropsWithChildren, ReactNode } from 'react'
import Controller from './Controller'

export interface ControllerProviderProps<C extends Controller<S>, S> {
  create: () => C
}

export type ControllerProvider<C extends Controller<S>, S> = React.FC<PropsWithChildren<ControllerProviderProps<C, S>>>

export type BuilderBuildWhen<S> = (prevState: S, currentState: S) => boolean

export interface BuilderProps<S> {
  builder: (state: S) => ReactNode
  buildWhen?: BuilderBuildWhen<S>
}

export type Builder<S> = React.FC<BuilderProps<S>>

export type ListenerListenWhen<S> = (prevState: S, currentState: S) => boolean

export interface ListenerProps<S> {
  listener: (state: S) => void
  listenWhen?: ListenerListenWhen<S>
}

export type Listener<S> = React.FC<PropsWithChildren<ListenerProps<S>>>

export interface ControllerContext<C extends Controller<S>, S> {
  Provider: ControllerProvider<C, S>
  Builder: Builder<S>
  Listener: Listener<S>
  _context: React.Context<C>
}
