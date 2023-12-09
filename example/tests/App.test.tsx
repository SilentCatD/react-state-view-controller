import { getByTestId, render } from '@testing-library/react'
import App from '../src/App'

test('inject success', () => {
  const { container } = render(<App />)
  const controllerExistElement = getByTestId(container, 'controller-exist-assertion-text')
  const text = controllerExistElement.textContent
  const expected = 'Controller existed!'
  expect(text).toBe(expected)
})
