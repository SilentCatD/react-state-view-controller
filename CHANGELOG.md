# 2.5.0

- Support functional overloading in `useBuilder`, `useListener`, `useSelector`, now these can be used directly with `Controller`
- Add `useAutoDispose` hook, allow the auto management of a `Controller` lifeCycle inside component.

# 2.4.1

- Now `Controller.emit(state)` can use partial state, no need for `{...this.state}` anymore
- Use `deepEqual` to enhance comparing function
