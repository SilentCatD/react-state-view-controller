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

### DI

### Provider

### Builder

### Listener

## Conclusion
