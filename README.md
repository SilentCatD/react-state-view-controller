[![npm version](https://badge.fury.io/js/react-state-view-controller.svg)](https://badge.fury.io/js/react-state-view-controller)

# React State-View-Controller

Alternatively, Model-View-Controller (MVC), if you prefer. If you don't want to hear the introduction, head directly to the `Usage` section.

[Example](https://github.com/SilentCatD/react-state-view-controller/tree/main/example)

## Overview

In my opinion, a robust state management system should effectively adhere to the following criteria:

1. **Effective Separation of Logic and UI**

   These two aspects should not be tightly coupled. While it may be acceptable for a single or simple component, when dealing with complex components, screens, or features (comprising multiple screens), the controlling logic should be separated. This separation brings several benefits:

   - Easier Dependency Injection (DI): We can create a network of interdependent `Controller` with clearly defined coupling relationships, adhering to the Component Principle.
   - State Lifecycle: A `State`/`Model` managing a `View` should align with the `View`'s lifecycle. When the screen is mounted, the `State` and `Controller` managed it is created and evolves throughout the `View` lifecycle, triggering UI layer re-rendering when it changes. When the `View` is unmounted, the managing `Controller` and `State` should be disposed of, cleaning up any unnecessary resources.
   - Abstraction: It hides the complexity of logic, allowing the UI to trigger a logic flow by simply calling a function in the `Controller`, which may involve complex interactions, operations through APIs, or interactions with other Controllers, and emit `State` as necessary.
   - Reusability: One of the advantages is the ease of reusing logic between different `Controllers`.

2. **Dependency Injection (DI)**

   A strong state management system should provide an effective mechanism for dependency injection. The `Controller` should be easily accessible for any of the children within its scope, especially those currently managed by it. The `Context` API is a good example of this mechanism, as it allows access to data without having to pass props down to every child component.

3. **Scoped Re-render Trigger and Re-render Filter**

   Regardless of how effectively the framework optimizes this process (e.g., comparing props in `React`), the trigger for the rebuild process should be optimized. It's better if we have more control over where and when this process occurs, even though it's just a trigger for UI re-rendering.

   We should be able to specify where re-rendering may occur and set conditions for it. For example, we might have a component that only re-renders when the `a` property of the `State` object is greater than `5`.

## Usage

This library is created to address the concerns mentioned above.

### Controller

The `State` object is something that holds data for UI rendering, and the UI uses `State` for its rendering process.

Take a look at some available function in the base `Controller` class. We won't have to re-write any of this, unless we want to.

```typescript
abstract class Controller<T> {
  // The initial state of the UI
  constructor(initialState: T)
  // The observable to subscribe to if necessary
  public get observable()
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
import { Controller } from 'react-state-view-controller'

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

One of many common patterns is to handle all of the necessary logic to fetch data from an API in the `Controller`, then emit the data from within the `Controller`. For example:

```ts
async fetchCounter() {
  this.emit({ ...this.state, loading: true });
  const newCounter = await fetchDataFromSource();
  this.emit({ ...this.state, loading: false, count: newCounter });
}
```

As you can see, we don't need to worry about UI-related code here. It is the UI's responsibility to subscribe to changes in the `State` object and render accordingly.

In the UI, we can then check for the `loading` property of the `State` object and render a `LoadingScreen` if necessary.

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

This hook should not cause re-render when new `State` is emitted.

#### Context hell

Now, we can observe that a wrapper like this indents the file slightly. However, when multiple `Provider` components are present, the file may appear disorganized.

For instance, you might encounter a structure like this:

```tsx
<CounterContext.Provider create={() => new CounterController()}>
  <CounterContext2.Provider create={() => new CounterController2()}>
    <CounterContext3.Provider create={() => new CounterController3()}>
      <CounterContext4.Provider create={() => new CounterController4()}>
        <App />
      </CounterContext4.Provider>,
    </CounterContext3.Provider>,
  </CounterContext2.Provider>,
</CounterContext.Provider>,
```

In such cases, the Nested component can be utilized to reduce indentation:

```tsx
import { Nested } from 'react-state-view-controller';

<Nested
  elements={[
    <CounterContext.Provider create={() => new CounterController()} />,
    <CounterContext2.Provider create={() => new CounterController2()} />,
    <CounterContext3.Provider create={() => new CounterController3()} />,
    <CounterContext4.Provider create={() => new CounterController4()} />,
  ]}
>
  <App />
</Nested>,

```

Both representations are equivalent. The nested component encompasses the others, granting access to the above `Context` and `Controller` if needed.

In situations where a single `Provider` requires access to the above `Controller` to depend on it, consider separating it into a distinct component:

```tsx
import { useController } from 'react-state-view-controller'

const Counter2Provider = ({ children }) => {
  const controller = useController(CounterContext)
  return <CounterContext2.Provider create={() => new CounterController2()}>{children}</CounterContext2.Provider>
}
```

This component can then be used as follows:

```tsx
<Nested
  elements={[
    <CounterContext.Provider create={() => new CounterController()} />,
    <Counter2Provider />,
    <CounterContext3.Provider create={() => new CounterController3()} />,
    <CounterContext4.Provider create={() => new CounterController4()} />,
  ]}
>
  <App />
</Nested>,

```

### Builder

To target and filter the re-render process when new State is emitted from `Controller` in the same scope, you can use the `Builder` component.

```tsx
const CounterComponent = () => {
  return (
    <CounterContext.Builder
      // you can also get the controller here : (state, controller) => ReactNode
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

There are hooks for this as well, in case you don't need to scope the re-render, but rather need to
render a whole component

```ts
import { useBuilder } from 'react-state-view-controller'

// buildWhen is also provided
const [state, controller] = useBuilder(CounterContext, (prev, curr) => true)
```

Usually, we don't need to watch for changes in the whole `State`, but rather just a portion of it

```ts
import { useSelector } from 'react-state-view-controller'

// only trigger re-render when `state.count5` changed
const [value, controller] = useSelector(CounterContext, (state) => state.count5)
```

### Listener

For triggering actions on the UI without causing a re-render, you can use this Component:

```tsx
const CounterListenerComponent = () => {
  return (
    <CounterContext.Listener
      // controller is also provided here: (state, controller) => void
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

The hook for it:

```tsx
import { useListener } from 'react-state-view-controller'

const controller = useListener(
  CounterContext,
  (state) => console.log(state), // callback when state changed
  (prev, curr) => true, // callback filter
)
```

Note that this hook is not intended by default to cause re-render, it just simply triggers callback

## Conclusion

[Example](https://github.com/SilentCatD/react-state-view-controller/tree/main/example)

Please open an issue if you spot any problems or for discussions. I would be happy to receive feedback.
