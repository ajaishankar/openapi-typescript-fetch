import { arrayRequestBody } from '../src'

describe('utils', () => {
  it('array request body with params', () => {
    const body = arrayRequestBody([{ item: 2 }], { param: 3 })
    expect(body.length).toEqual(1)
    expect(body[0]?.item).toEqual(2)
    expect(body.param).toEqual(3)
  })
})
