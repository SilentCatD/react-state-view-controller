# React State-View-Controller

[![NPM version][npm-image]][npm-url]
[![codecov][codecov-image]][codecov-url]
[![npm bundle size][npm-bundle-size-image]][npm-bundle-size-url]
[![Build][github-build]][github-build-url]
[![License][github-license]][github-license-url]

[codecov-url]: https://codecov.io/github/SilentCatD/react-state-view-controller
[codecov-image]: https://codecov.io/github/SilentCatD/react-state-view-controller/graph/badge.svg?token=QVRSQ5QI4D
[npm-url]: https://www.npmjs.com/package/react-state-view-controller
[npm-image]: https://img.shields.io/npm/v/react-state-view-controller
[npm-bundle-size-image]: https://img.shields.io/bundlephobia/min/react-state-view-controller
[npm-bundle-size-url]: https://bundlephobia.com/package/react-state-view-controller
[github-license]: https://img.shields.io/github/license/SilentCatD/react-state-view-controller
[github-license-url]: https://github.com/SilentCatD/react-scoped-provider/blob/main/LICENSE
[github-build]: https://github.com/SilentCatD/react-state-view-controller/actions/workflows/publish.yml/badge.svg
[github-build-url]: https://github.com/SilentCatD/react-state-view-controller/actions/workflows/publish.yml

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

Defining a `Controller` for a view for view group in a class manner will benefit from these criterias:

- `Inter-Controller Subscription`: `Controller` can subscribe to and depend on each other, allowing for the internal triggering of state emissions.

- `Inheritance and Extensibility`: By making use of inheritance, a `Controller` can be further extended, leading to more reusable code.

- `Property Manipulation`: Creating, accessing, and modifying properties within a Controller becomes straightforward.

The `State` object is something that holds data for UI rendering, and the UI uses `State` for its rendering process.

Take a look at some available function in the base `Controller` class. We won't have to re-write any of this, unless we want to.

```ts
abstract class Controller<T> {
  // The initial state of the UI
  constructor(initialState: T)

  // The observable to subscribe to if necessary
  // Will fire new states and notifying listeners.
  public get observable(): Observable<T>

  // The current state that the controller is maintaining
  public get state(): T

  // Emit a new state and trigger all listeners.
  // Will be merged with existed state
  protected emit(state: Partial<T>)

  // Override if necessary to clean up any resources.
  // Will be called when attached view unmounted
  public async dispose(): Promise<void>
}
```

A `Controller` will directly interact with the `State` object to mutate it, indirectly causing UI re-rendering.

To create a new `Controller`, you need to extend the `Controller` class, which provides methods for state mutation and notifying listeners. In the example above, the `CounterController` has `{count: 0}` as its `initialState`. It updates it through methods like `increaseCounter` or `decreaseCounter` using `emit(newState)`.

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
    // Use `emit` to update new state.
    this.emit({ count: this.state.count + 1 })
  }
  decreaseCounter() {
    this.emit({ count: this.state.count - 1 })
  }
}
```

Do note that the `newState` object must be different from the old `State`. Otherwise, the `Controller` will just skip it. This optimization avoids unnecessary state updates.

When using `emit`, the `{...this.state}` is not needed. Object passed in the `emit(newState)` function will be merge with the existed current state.

One of many common patterns is to handle all of the necessary logic to fetch data from an API in the `Controller`, then emit the data from within the `Controller`. For example:

```ts
import { Controller } from 'react-state-view-controller'

type CounterState = {
  loading: boolean
  count: number
}

class CounterController extends Controller<CounterState> {
  ///
  async fetchCounter() {
    this.emit({ loading: true })

    // some function to fetch data
    const newCounter = await fetchDataFromSource()

    // emit new state with changed data
    this.emit({ loading: false, count: newCounter })
  }
  ///
}
```

As you can see, we don't need to worry about UI-related code here in this `async` operation. It is the UI's responsibility to subscribe to changes in the `State` object and render accordingly.

In the UI, we can then check for the `loading` property of the `State` object and render a `LoadingScreen` if necessary.

### Provider and Dependency Injection (DI)

A `Controller` manages states for a scope of child components, and so it must be provided to them for further interaction and triggering re-render. This is similar to the `Context` API. In fact, this library uses the `Context` API internally for DI.

To provide a group of child components with a `Controller`, we can use `ControllerProvider`:

```tsx
<ControllerProvider source={() => new CounterController()}>
  <CounterComponent />
  <ButtonComponent />
</ControllerProvider>
```

The `source` parameter take in a function to create `Controller` and keep it with `useRef` throughout the component's life-span. When the component unmounted, a clean up function will be called and automatically trigger the `dispose` function defined inside the `Controller` class, allow resources clean up.

Another way to provide a `Controller` to children components would be using `ControllerProvider` but pass in the `source` param an instance of `Controller` instead of a create function

```tsx
<ControllerProvider source={counterControllerInstance}>
  <CounterComponent />
  <ButtonComponent />
</ControllerProvider>
```

But be aware that `Controller` provided this way won't be kept with `useRef` like the first one, and maybe subjected to change, clean up function also won't be called for this type of `ControllerProvider`

The `CounterComponent` and `ButtonComponent` will now have access to the `CounterController`.

Inside the `ButtonComponent` or `CounterComponent`, you can get the provided `CounterController` instance through the `useProvider` hook:

```tsx
import { useProvider } from 'react-state-view-controller'

const ButtonComponent = () => {
  // pass in the type of provided controller
  const controller = useProvider(CounterController)
  return (
    <div>
      <button onClick={() => controller.increaseCounter()}>Increase</button>
      <button onClick={() => controller.decreaseCounter()}>Decrease</button>
    </div>
  )
}
```

You can interact with the provided `CounterController` as needed. Please note that this will get the nearest provided `CounterController`, and if it can't find one (e.g., if a `CounterController` is not provided to this scope), an error will be thrown.

This hook should not cause re-render when new `State` from `CounterController` is emitted.

The instance passed in `ControllerProvider` will have it's name extracted and used as a resource-key for later query, this mean if you provide a class with the name `A`, you have to use the exact type to query it with `useProvider` hook.

But for cases that one type of `Controller` may has many implemmentations, subclass-ing each other, and we only want the dependent/client of this controller know it's base type, we can use the `ctor` param in `ProviderController`, this effectively change the query type of provided `Controller`

```tsx
// query type will now become `TestController`: useProvider(TestController)
<ControllerProvider ctor={TestController} source={()=> SubclassOfTestController()}>
  <Screen />
</ControllerProvider>,
```

#### Context hell

Now, we can observe that a wrapper like this indents the file slightly. However, when multiple `ControllerProvider` components are present, the file may appear disorganized.

For instance, you might encounter a structure like this:

```tsx
<ControllerProvider create={() => new CounterController()}>
  <ControllerProvider create={() => new CounterController2()}>
    <ControllerProvider create={() => new CounterController3()}>
      <ControllerProvider create={() => new CounterController4()}>
        <App />
      </ControllerProvider>,
    </ControllerProvider>,
  </ControllerProvider>,
</ControllerProvider>,
```

In such cases, the `MultiProvider` component can be utilized to reduce indentation:

```tsx
import { MultiProvider } from 'react-state-view-controller';

<MultiProvider
  providers={[
    <ControllerProvider create={() => new CounterController()} />,
    <ControllerProvider create={() => new CounterController2()} />,
    <ControllerProvider create={() => new CounterController3()} />,
    <ControllerProvider create={() => new CounterController4()} />,
  ]}
>
  <App />
</MultiProvider>,

```

Both representations are equivalent. The nested component encompasses the others, granting access to the above `Controller` if needed.

In situations where a single `ControllerProvider` requires access to the above `Controller` to depend on it, consider separating it into a distinct component:

```tsx
import { useProvider } from 'react-state-view-controller'

const Counter2Provider = ({ children }) => {
  // We can get the CounterController here because it's provided is above this component.
  const controller = useProvider(CounterController)
  // do something with CounterController
  // ...

  return <ControllerProvider create={() => new CounterController2()}>{children}</ControllerProvider>
}
```

Then this component can then be used as follows:

```tsx
<MultiProvider
  providers={[
    <ControllerProvider create={() => new CounterController()} />,
    <Counter2Provider />,
    <ControllerProvider create={() => new CounterController3()} />,
    <ControllerProvider create={() => new CounterController4()} />,
  ]}
>
  <App />
</MultiProvider>,
```

### useAutoDispose

While `ControllerProvider` provides an effective way of DI, there are times that this is unecessary, as we just simply want to separate logic of a small view to a controller, but still want to benefit from the auto-cleanup feature.

In this case, we can use the `useAutoDispose` hook:

```tsx
const controller = useAutoDispose(() => new CounterController())
```

This `controller` instance will be kept with `useRef`, making it persist between re-render and will auto call the `dispose` function when current component is unmounted.

Controller created this way can also be feed into the `source` param of `ProviderController` mentioned above, preferably the second type, which `source` take in an instance, as the responsibility of maintaining instance and auto cleaning up feature is handled already by `useAutoDispose`.

### Builder

To trigger the re-render process when new State is emitted from `Controller` within the same scope, you can use the `Builder` component.

```tsx
<Builder
  // specify the type to query
  source={CounterController}
  buildWhen={(prev, curr) => {
    // Optional: If this function is provided and returns `false`, the re-render trigger will be skipped.
    // We are provided with the previous state - the state that the component is using for rendering,
    // and the new state, which will potentially be used for rendering if we return true or omit
    // this function entirely.
  }}
>
  {(state: number, controller: CounterController) => {
    // render content based on state
    return <View></View>
  }}
</Builder>
```

This component can also take in directly an instance of `Controller` as the `source` instead of a type.

```tsx
<Builder
  // passing an instance
  source={counterControllerInstance}
  buildWhen={(prev, curr) => true}
>
  {(state: number) => {
    // render content based on state
    return <View></View>
  }}
</Builder>
```

There are hooks for all of this as well, in case you don't need to scope the re-render, but rather need to
render a whole component, or you just prefer hook.

```ts
import { useBuilder } from 'react-state-view-controller'

// buildWhen is also provided
// type
const [state, controller] = useBuilder(CounterController, (prev, curr) => true)
// or instance
const state = useBuilder(counterControllerInstance)
```

### Selector

Usually, we don't need to watch for changes in the whole `State`, but rather just a portion of it, `Selector` can be used to do state-filtering.

```tsx
// only re-render when state.count5 changed
<Selector source={MultiCounterController} selector={(state) => state.count5}>
  {(value, controller) => {
    // render content based on selected value
    return <View></View>
  }}
</Selector>
```

It also support direct controller instance variant

```tsx
<Selector source={multiCounterControllerInstance} selector={(state) => state.count5}>
  {(value) => {
    // render content based on selected value
    return <View></View>
  }}
</Selector>
```

Alternatively, we can use the `useSelector` hook

```ts
import { useSelector } from 'react-state-view-controller'

// only trigger re-render when `state.count5` changed
const [value, controller] = useSelector(CounterController, (state) => state.count5)
// or the equivalent
const value = useSelector(counterControllerInstance, (state) => state.count5)
```

### Listener

For triggering actions on the UI without causing a re-render, you can use this Component:

```tsx
<Listener
  // specify the type
  source={CounterController}
  // callback when new state emitted
  listener={(state: number, controller: CounterController) => console.log(state)}
  // for state filter, similar with Builder
  listenWhen={(prev: number, current: number) => true}
>
  <View></View>
</Listener>
```

You will be provided with the `listener` callback to be called when the State changes. There is also `listenWhen`, similar to `Builder.buildWhen`, to filter changes in `State` to listen to as needed.

The controller instance variant:

```tsx
<Listener
  source={counterControllerInstance}
  listener={(state: number) => console.log(state)}
  listenWhen={(prev: number, current: number) => true}
>
  <View></View>
</Listener>
```

The hooks for this feature:

```tsx
import { useListener } from 'react-state-view-controller'

const controller = useListener(
  CounterController,
  (state: number, controller: CounterController) => console.log(state), // callback when state changed
  (prev, curr) => true, // callback filter
)
// or
const controller = useListener(
  counterControllerInstance,
  (state) => console.log(state), // callback when state changed
  (prev, curr) => true, // callback filter
)
```

Note that this hook is not intended by default to cause re-render, it just simply triggers callback

## Conclusion

[Example](https://github.com/SilentCatD/react-state-view-controller/tree/main/example)

Please open an issue if you spot any problems or for discussions. I would be happy to receive feedback.
