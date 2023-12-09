# 3.0.0

- Revamp the whole DI mechanism, remove `Context`, remove `useController`. Use `useProvider` instead.
- Setup Github CI/CD
- Test/ coverage test
- Remove ability to define `Controller` in a functional way
- Removed hooks: `useController`, use
- Hooks: `useBuilder`, `useListener`, `useSelector` now can take in directly an instance of `Controller`
- Hooks: `useAutoDispose` introduced

# 2.4.1

- Now `Controller.emit(state)` can use partial state, no need for `{...this.state}` anymore
- Use `deepEqual` to enhance comparing function
