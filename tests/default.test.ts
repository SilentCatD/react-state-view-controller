import { Create } from '../src'

it('default', () => {
  const create: Create<string> = () => 'str'
  expect(create()).toBe('str')
})
