import { OpArgType } from '../src'

import { components, paths } from './examples/stations'
type Op = paths['/stations']['post']
type Argument = components['schemas']['CreateStation']

type InferredArgument = OpArgType<Op>

type Same<A, B> = A extends B ? (B extends A ? true : false) : false

describe('infer', () => {
  it('argument', () => {
    const same: Same<Argument, InferredArgument> = true
    expect(same).toBe(true)
  })
})
