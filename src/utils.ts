import deepEqual from 'deep-equal'

function isEquals(a: any, b: any): boolean {
  return deepEqual(a, b, { strict: true })
}
export { isEquals }
