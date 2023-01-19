import {
  FetchArgType,
  Fetcher,
  FetchErrorType,
  FetchReturnType,
  OpArgType,
  OpDefaultReturnType,
  OpErrorType,
  OpReturnType,
  TypedFetch,
} from '../src'
import { paths } from './paths'
import { paths as paths2 } from './examples/stripe-openapi2'
import { paths as paths3 } from './examples/stripe-openapi3'

type Op2 = paths2['/v1/account_links']['post']

// currently only application/json is supported for body
type Op3 = Omit<paths3['/v1/account_links']['post'], 'requestBody'> & {
  requestBody: {
    content: {
      'application/json': paths3['/v1/account_links']['post']['requestBody']['content']['application/x-www-form-urlencoded']
    }
  }
}

interface Openapi2 {
  Argument: OpArgType<Op2>
  Return: OpReturnType<Op2>
  Default: Pick<OpDefaultReturnType<Op2>['error'], 'type' | 'message'>
  Error: Pick<OpErrorType<Op2>['data']['error'], 'type' | 'message'>
}

interface Openapi3 {
  Argument: OpArgType<Op3>
  Return: OpReturnType<Op3>
  Default: Pick<OpDefaultReturnType<Op3>['error'], 'type' | 'message'>
  Error: Pick<OpErrorType<Op3>['data']['error'], 'type' | 'message'>
}

type Same<A, B> = A extends B ? (B extends A ? true : false) : false

describe('infer', () => {
  it('queryParams', () => {
    const fetcher = Fetcher.for<paths>()

    fetcher
      .path('/bodyquery/{id}')
      .method('post')
      // @ts-expect-error // Missing the optional param is wrong
      .create({ scalar: 1 })

    fetcher
      .path('/bodyquery/{id}')
      .method('post')
      .create({ scalar: 1, optional: 1 })

    expect(true).toBe(true)
  })

  it('argument', () => {
    const same: Same<Openapi2['Argument'], Openapi3['Argument']> = true
    expect(same).toBe(true)

    const arg: Openapi2['Argument'] = {} as any
    expect(arg.account).toBeUndefined()
  })

  it('return', () => {
    const same: Same<Openapi2['Return'], Openapi3['Return']> = true
    expect(same).toBe(true)

    const ret: Openapi2['Return'] = {} as any
    expect(ret.url).toBeUndefined()
  })

  it('default', () => {
    const same: Same<Openapi2['Default'], Openapi3['Default']> = true
    expect(same).toBe(true)
  })

  it('error', () => {
    const same: Same<Openapi2['Error'], Openapi3['Error']> = true
    expect(same).toBe(true)
  })

  describe('fetch', () => {
    type CreateLink = TypedFetch<Op2>

    const fetcher = Fetcher.for<paths2>()
    const createLink: CreateLink = fetcher
      .path('/v1/account_links')
      .method('post')
      .create()

    type Arg = FetchArgType<typeof createLink>
    type Ret = FetchReturnType<typeof createLink>
    type Err = FetchErrorType<typeof createLink>

    it('argument', () => {
      const same: Same<Arg, Openapi2['Argument']> = true
      expect(same).toBe(true)
    })

    it('return', () => {
      const same: Same<Ret, Openapi2['Return']> = true
      expect(same).toBe(true)
    })

    it('error', () => {
      const same: Same<
        Err,
        OpErrorType<paths2['/v1/account_links']['post']>
      > = true
      expect(same).toBe(true)
    })

    it('only header/cookie parameter with requestBody', () => {
      type RequestBody = {
        requestBody: {
          content: {
            'application/json': { bar: boolean }
          }
        }
      }

      type HeaderOnly = {
        parameters: {
          header: { foo: string }
        }
      } & RequestBody

      type CookieOnly = {
        parameters: {
          cookie: { foo: string }
        }
      } & RequestBody

      const header: Same<OpArgType<HeaderOnly>, { bar: boolean }> = true
      const cookie: Same<OpArgType<CookieOnly>, { bar: boolean }> = true

      expect(header).toBe(true)
      expect(cookie).toBe(true)
    })

    const err: Err = { data: { error: {} } } as any
    expect(err.data.error.charge).toBeUndefined()
  })
})
