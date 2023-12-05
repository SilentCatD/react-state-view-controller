import Controller from '../Controller'

type ListenerListenWhen<S> = (prevState: S, currentState: S) => boolean

function useListener<C extends Controller<S>, S>(listener: (state: S) => void, listenWhen?: ListenerListenWhen<S>): C
