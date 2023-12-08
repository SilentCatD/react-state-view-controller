import { isEqual } from '../../src'

it('different object with different content resolve to false', () => {
  const a = {
    count: 1,
    msg: 'hello',
  }
  const b = {
    count: 2,
    msg: 'hell0',
  }
  const isEqualResult = isEqual(a, b)
  const expected = false
  expect(isEqualResult).toBe(expected)
})

it('different object with the same content resolve to true', () => {
  const a = {
    count: 1,
    msg: 'hello',
  }
  const b = {
    count: 1,
    msg: 'hello',
  }
  const isEqualResult = isEqual(a, b)
  const expected = true
  expect(isEqualResult).toBe(expected)
})

it('different object with different content resolve to false nested', () => {
  const a = {
    count: 1,
    msg: 'hello',
    extra: {
      count: 1,
      msg: 'hello',
    },
  }
  const b = {
    count: 1,
    msg: 'hello',
    extra: {
      count: 2,
      msg: 'hell0',
    },
  }
  const isEqualResult = isEqual(a, b)
  const expected = false
  expect(isEqualResult).toBe(expected)
})

it('different object with same content resolve to true nested', () => {
  const a = {
    count: 1,
    msg: 'hello',
    extra: {
      count: 2,
      msg: 'hell0',
    },
  }
  const b = {
    count: 1,
    msg: 'hello',
    extra: {
      count: 2,
      msg: 'hell0',
    },
  }
  const isEqualResult = isEqual(a, b)
  const expected = true
  expect(isEqualResult).toBe(expected)
})
