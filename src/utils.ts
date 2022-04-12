/**
 * Helper to merge params when request body is an array
 */
export function arrayRequestBody<T, O>(array: T[], params?: O): T[] & O {
  return Object.assign([...array], params)
}
