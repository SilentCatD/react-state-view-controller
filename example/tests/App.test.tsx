import {  render } from '@testing-library/react'
import App from '../src/App'

test('inject success', () => {
  render(<App />)

  expect(true).toBe(true);
})
