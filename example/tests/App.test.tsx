import { act, fireEvent, getByTestId, render } from '@testing-library/react'
import App from '../src/App'

test('inject success', () => {
  const { container } = render(<App />)
  const controllerConsumer = getByTestId(container, 'controller-consumer')
  const text = controllerConsumer.textContent
  const expected = 'Controller existed!'
  expect(text).toBe(expected)
})

test('Listener', () => {
  const { container } = render(<App />)
  const listenerEl = getByTestId(container, 'controller-listener')
  const text = listenerEl.textContent
  const expected = `Listenner mounted`
  expect(text).toBe(expected)
})

test('Counter', () => {
  const { container } = render(<App />)
  const btnEl = getByTestId(container, 'counter-btn')

  let counterTextEl = getByTestId(container, 'counter-text')
  let text = counterTextEl.textContent
  let expected = `Counter: ${0}`
  expect(text).toBe(expected)

  act(() => {
    fireEvent.click(btnEl)
  })
  counterTextEl = getByTestId(container, 'counter-text')
  text = counterTextEl.textContent
  expected = `Counter: ${1}`
  expect(text).toBe(expected)

  act(() => {
    fireEvent.click(btnEl)
  })
  counterTextEl = getByTestId(container, 'counter-text')
  text = counterTextEl.textContent
  expected = `Counter: ${2}`
  expect(text).toBe(expected)

  act(() => {
    fireEvent.click(btnEl)
  })
  counterTextEl = getByTestId(container, 'counter-text')
  text = counterTextEl.textContent
  expected = `Counter: ${3}`
  expect(text).toBe(expected)
})

test('Counter2', () => {
  const { container } = render(<App />)
  const btnEl = getByTestId(container, 'counter2-btn')

  let counterTextEl = getByTestId(container, 'counter2-text')
  let text = counterTextEl.textContent
  let expected = `Counter2: ${0}`
  expect(text).toBe(expected)

  act(() => {
    fireEvent.click(btnEl)
  })
  counterTextEl = getByTestId(container, 'counter2-text')
  text = counterTextEl.textContent
  expected = `Counter2: ${1}`
  expect(text).toBe(expected)

  act(() => {
    fireEvent.click(btnEl)
  })
  counterTextEl = getByTestId(container, 'counter2-text')
  text = counterTextEl.textContent
  expected = `Counter2: ${2}`
  expect(text).toBe(expected)

  act(() => {
    fireEvent.click(btnEl)
  })
  counterTextEl = getByTestId(container, 'counter2-text')
  text = counterTextEl.textContent
  expected = `Counter2: ${3}`
  expect(text).toBe(expected)
})
