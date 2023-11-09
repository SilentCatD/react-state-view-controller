import { PropsWithChildren, ReactNode } from 'react'
import Controller from './Controller'

export interface ControllerProviderProps<C extends Controller<S>, S> {
  create: () => C
}

export type ControllerProvider<C extends Controller<S>, S> = React.FC<PropsWithChildren<ControllerProviderProps<C, S>>>

export type BuilderBuildWhen<S> = (prevState: S, currentState: S) => boolean

export interface BuilderProps<C extends Controller<S>, S> {
  builder: (state: S, controller: C) => ReactNode
  buildWhen?: BuilderBuildWhen<S>
}

export type Builder<C extends Controller<S>, S> = React.FC<BuilderProps<C, S>>

export type ListenerListenWhen<S> = (prevState: S, currentState: S) => boolean

export interface ListenerProps<C extends Controller<S>, S> {
  listener: (state: S, controller: C) => void
  listenWhen?: ListenerListenWhen<S>
}

export type Listener<C extends Controller<S>, S> = React.FC<PropsWithChildren<ListenerProps<C, S>>>

export interface ControllerContext<C extends Controller<S>, S> {
  Provider: ControllerProvider<C, S>
  Builder: Builder<C, S>
  Listener: Listener<C, S>
  _context: React.Context<C>
}
