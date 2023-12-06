import deepEqual from 'deep-equal'

function isEqual(a: any, b: any): boolean {
  return deepEqual(a, b, { strict: true })
}

export { isEqual }
