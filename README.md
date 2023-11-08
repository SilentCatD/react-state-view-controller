[![npm version](https://badge.fury.io/js/react-state-view-controller.svg)](https://badge.fury.io/js/react-state-view-controller)

# React State-View-Controller

Alternatively, Model-View-Controller (MVC), if you prefer. If you don't want to hear the introduction, head directly to the `Usage` section.

## Overview

In my opinion, a robust state management system should effectively adhere to the following criteria:

1. **Effective Separation of Logic and UI**

   These two aspects should not be tightly coupled. While it may be acceptable for a single or simple component, when dealing with complex components, screens, or features (comprising multiple screens), the controlling logic should be separated. This separation brings several benefits:

   - Easier Dependency Injection (DI): We can create a network of interdependent `Controller` with clearly defined coupling relationships, adhering to the Component Principle.
   - State Lifecycle: A `State`/`Model` managing a `View` should align with the `View`'s lifecycle. When the screen is mounted, the `State` and `Controller` managed it is created and evolves throughout the `View` lifecycle, triggering UI layer re-rendering when it changes. When the `View` is unmounted, the managing `Controller` should be disposed of, cleaning up any necessary resources.
   - Abstraction: It hides the complexity of logic, allowing the UI to trigger a logic flow by simply calling a function in the `Controller`, which may involve complex interactions, operations through APIs, or interactions with other Controllers, and emit `State` as necessary.
   - Reusability: One of the advantages is the ease of reusing logic between different `Controllers`.

2. **Dependency Injection (DI)**

   A strong state management system should provide an effective mechanism for dependency injection. The `Controller` should be easily accessible for any of the children within its scope, especially those currently managed by it. The `Context` API is a good example of this mechanism, as it allows access to data without having to pass props down to every child component.

3. **Scoped Re-render Trigger and Re-render Filter**

   Regardless of how effectively the framework optimizes this process (e.g., comparing props in `React`), the trigger for the rebuild process should be optimized. It's better if we have more control over where and when this process occurs, even though it's just a trigger for UI re-rendering.

   We should be able to specify where re-rendering may occur and set conditions for it. For example, we might have a component that only re-renders when the `a` property of the State object is greater than `5`.

## Usage

This library is created to address the concerns mentioned above.

### Controller

The `State` object is something that holds data for UI rendering, and the UI uses `State` for its rendering process.

```typescript
abstract class Controller<T> {
  // The initial state of the UI
  constructor(initialState: T)
  // The RxJS subject to subscribe to if necessary
  public get subject()
  // The current state that the controller is maintaining
  public get state()
  // Emit a new state and trigger all listeners.
  // Note that it must be a new object, different from the old state,
  // or the new state emission will be skipped.
  protected emit(state: T)
  public async dispose() // Override if necessary to clean up any resources.
}
```

A `Controller` will directly interact with the `State` object to mutate it, indirectly causing UI re-rendering.

```ts
type CounterState = {
  count: number
}

class CounterController extends Controller<CounterState> {
  constructor() {
    super({ count: 0 })
  }
  increaseCounter() {
    // Use `emit` with a new object to update the new State for the controller.
    this.emit({ count: this.state.count + 1 })
  }
  decreaseCounter() {
    this.emit({ count: this.state.count - 1 })
  }
}
```

To create a new `Controller`, you need to extend the `Controller` class, which provides methods for state mutation and notifying listeners. In the example above, the `CounterController` has `{count: 0}` as its `initialState`. It updates it through methods like `increaseCounter` or `decreaseCounter` using `emit(newState)`.

Do note that the `newState` object must be different from the old `State`. Otherwise, the `Controller` will just skip it. This optimization avoids unnecessary state updates.

### Provider and Dependency Injection (DI)

A `Controller` manages a scope of child components, and it must be provided to them. This is similar to the `Context` API. In fact, this library uses the `Context` API internally for DI.

First, create a `Context`:

```ts
import { createControllerContext } from 'react-state-view-controller'

const CounterContext = createControllerContext<CounterController, CounterState>()
```

This `Context` is important later on to access many of this library's features.

To provide child components with a `Controller`, inject it properly through `Context.Provider`:

The `create` parameter expects a new instance of `CounterController` to be provided.

```tsx
<CounterContext.Provider create={() => new CounterController()}>
  <CounterComponent />
  <ButtonComponent />
</CounterContext.Provider>
```

The `CounterComponent` and `ButtonComponent` will now have access to the `CounterController`.

Inside the `ButtonComponent` or any other component, you can get the provided `Controller` instance through the `useController` hook:

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

You can interact with the provided `Controller` as needed. Please note that this will get the nearest provided `Controller`, and if it can't find one (e.g., if the `Controller` is not provided to this scope), an error will be thrown.

### Builder

To target and filter the re-render process when new State is emitted from `Controller` in the same scope, you can use the `Builder` component.

```tsx
const CounterComponent = () => {
  return (
    <CounterContext.Builder
      builder={(state) => {
        return <h2>{state.count}</h2>
      }}
      buildWhen={(prev, curr) => {
        // Optional: If this function is provided and returns `false`, the re-render trigger will be skipped.
        // We are provided with the previous state - the state that the component is using for rendering,
        // and the new state, which will potentially be used for rendering if we return true or omit 
        // this function entirely.
      }}
    />
  )
}
```

### Listener

For triggering actions on the UI without causing a rebuild, you can use this Component:

```tsx
const CounterListenerComponent = () => {
  return (
    <CounterContext.Listener
      listener={(state) => {
        // This is not a re-render trigger, just a log when the state changes.
      }}
      listenWhen={(prev, curr) => {
        // Return `false` here to skip the listener.
      }}
    >
      <h2>Not a re-render when the state changes</h2>
    </CounterContext.Listener>
  )
}
```

You will be provided with the `listener` callback to be called when the State changes. There is also `listenWhen`, similar to `Builder.buildWhen`, to filter changes in `State` to listen to as needed.

## Conclusion

Please open an issue if you spot any problems or for discussions. I would be happy to receive feedback.
