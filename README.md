[![npm version](https://badge.fury.io/js/react-state-view-controller.svg)](https://badge.fury.io/js/react-state-view-controller)

# React state-view-controller

Or model-view-controller (MVC) if you will.
If you don't need to hear my yapping, head to the `Usage` section.

## Brief

A good state management system, in my opinion, is a system that effectively conform to the following criteria:

1. Effectively separate between logic and UI

These things shouldn't be couple together on the UI with high complexity, for a single or simple component, it should be fine. But were the components is complex, or a screen, or a feature (many screens), the controlling logic should be separated. This would prove to be beneficial:

- Easier DI: we could create a network of `Controllers` dependent on each other if necessary, with coupling relationship clearly defined, conform to the Component Principle
- State lifecycle: a `State`/`Model` that manage a `View` should conform to the `View`'s lifecycle. When the screen is mounted, the `State` is then born and mutated throughout the `View` lifecycle, trigger the re-rendering of UI layer when it is mutated, and when the `View` is unmounted, the managing `Controller` should be dispose by then, cleaning up any necessary recourses.
- Abstraction: hide logic complexity, UI can trigger a flow of logic by simply calling a function in the `Controller`, which may perform complex interaction, operation through API or other Controllers, then emit `State` as necessary
- Reusable: One of the beneficial things may also be the easily reusable of logic between different `Controllers

2. DI

A good state management system should provide mechanism for effective dependency injection. The `Controller` should be easily reachable for any of the children in it's scope, for the children that is currently managed by it.
`Context` API is a good example of this mechanism as we can reach for any data without having passing prop down to every children components

3. Scoped re-render-trigger and re-render-filter

No matter how effective the framework optimize this by itself (comparing prop in `React` for example). The trigger of the rebuild process should be optimized as well, it would be better if we have more control over where and when does this process happen, although it is just a triggering process for UI re-render.

We should be able to target where exactly will the re-render may happen, and set the condition for it. For example, we have a component that will only re-render when the property `a` of the State
object is bigger than `5`

## Usage

This library is created to address the above mentioned concerns.

### Controller

`State` object is something that will hold data for UI rendering, UI will use `State` for it's rendering process

```ts
abstract class Controller<T> {
  constructor(initialState: T) // initialState is the first state of the UI
  public get subject() // the rx-subject to subcribe if nessesary
  public get state() // the current state that the controller is keeping
  protected emit(state: T) // emit new state and trigger for all listener, note that it must be a new object, a different object from the old state, or the new state emitting will be skipped
  public async dispose() // override if necessary to clean up any recources.
}
```

A `Controller` will directly interact with the `State` object to mutate it, indirectly causing UI re-render.

```ts
type CounterState = {
  count: number
}

class CounterController extends Controller<CounterState> {
  constructor() {
    super({ count: 0 })
  }
  increaseCounter() {
    this.emit({ count: this.state.count + 1 }) // Use emit with new object to update new State for controller.
  }
  decreaseCounter() {
    this.emit({ count: this.state.count - 1 })
  }
}
```

To create a new `Controller`, we need to `extends` the `Controller` class, which provided methods for state mutating and notifying listeners.

In the above example, we have the `CounterController` with `{count: 0}` as it `initialState`. It will then through other method like `increaseCounter` or `decreaseCounter` to update it through the `emit(newState)` function.

Do note that the the `newState` object must be different from the old `State`. Or the `Controller` will just skip it, this is an optimization for avoiding unnecessary state updating.

### Provider and DI

A `Controller` manage a scope of `Children Components`, and it must be provide to them. It's similar to `Context` API, in fact, the internal of this library use `Context` API for `DI` .

First create a `Context`:

```ts
import { createControllerContext } from 'react-state-view-controller'

const CounterContext = createControllerContext<CounterController, CounterState>()
```

This `Context` is important later on to access many of this library feature.

To provide children component with a `Controller`, we should properly inject it through `Context.Provider`:

The params `create` expect a new instance of `CounterController` to be provided.

```tsx
<CounterContext.Provider create={() => new CounterController()}>
  <CounterComponent />
  <ButtonComponent />
</CounterContext.Provider>
```

The `CounterComponent` and `ButtonComponent` will now have access to the `CounterController`

Inside the `ButtonComponent`, or any other component, we could get the provided instance of `Controller` through the hook `useController`:

```tsx
import { useController } from 'react-state-view-controller'

const ButtonComponent = () => {
  const controller = useController(CounterContext)
  return (
    <div>
      <button onClick={() => controller.increaseCounter()}>Increase</button>
      <button onClick={() => controller.decreaseCounter()}>Decrease</button>
    </div>
  )
}
```

We can interact with the provided `Controller` as needed. Note that this will get the nearest provided `Controller`, and if it can't find any, eg: `Controller` is not provided to this scope, an `Error` would be thrown.

### Builder

To target and filter the re-render process when new `State` is emitted from `Controller` in the same scope, we can use the `Builder` component.

```tsx
const CounterComponent = () => {
  return (
    <CounterContext.Builder
      builder={(state) => {
        return <h2>{state.count}</h2>
      }}
      buildWhen={(prev, curr) => {
        // optional, if this function is provided and return `false`, the re-render
        // trigger will be skipped. We are provided with the prev, the current state
        // that component is using for render, and the new state, which will potentially
        // be used for render if we return true or omit this function entirely.
      }}
    />
  )
}
```

### Listener

For triggering action on UI, without causing rebuild, we could use this Component:

```tsx
const CounterListenerComponent = () => {
  return (
    <CounterContext.Listener
      listener={(state) => {
        // console.log('this is not re-render trigger, just log when state change')
      }}
      listenWhen={(prev, curr) => {
        // return false here to skip the listener
      }}
    >
      <h2>Not re-render when state changed</h2>
    </CounterContext.Listener>
  )
}
```

We would be provided with the `listener` callback, to be called when `State` is changed from the `Controller`
There is also `listenWhen`, similar to `Builder.buildWhen` to filter changes in `State` to listen to as needed.

## Conclusion

Please do open an issue if you spot any, or simply for discussion, I would be happy to hear feedbacks.
