import 'whatwg-fetch'

import { server } from './mocks/server'
import { ApiError, FetchArgType, Fetcher, FetchReturnType } from '../src'
import { Data, paths } from './paths'
import { paths as stripePaths } from './examples/stripe-openapi2'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetch', () => {
  const fetcher = Fetcher.for<paths>()

  beforeEach(() => {
    fetcher.configure({
      baseUrl: 'https://api.backend.dev',
      init: {
        headers: {
          Authorization: 'Bearer token',
        },
      },
    })
  })

  const expectedHeaders = {
    authorization: 'Bearer token',
    'content-type': 'application/json',
    accept: 'application/json',
  }

  it('GET /query/{a}/{b}', async () => {
    const fun = fetcher.path('/query/{a}/{b}').method('get').create()

    const { ok, status, statusText, data } = await fun({
      a: 1,
      b: 2,
      scalar: 'a',
      list: ['b', 'c'],
    })

    expect(data.params).toEqual({ a: '1', b: '2' })
    expect(data.query).toEqual({ scalar: 'a', list: ['b', 'c'] })
    expect(data.headers).toEqual(expectedHeaders)
    expect(ok).toBe(true)
    expect(status).toBe(200)
    expect(statusText).toBe('OK')
  })

  const methods = ['post', 'put', 'patch', 'delete'] as const

  methods.forEach((method) => {
    it(`${method.toUpperCase()} /body/{id}`, async () => {
      const fun = fetcher.path('/body/{id}').method(method).create()

      const { data } = await fun({
        id: 1,
        list: ['b', 'c'],
      })

      expect(data.params).toEqual({ id: '1' })
      expect(data.body).toEqual({ list: ['b', 'c'] })
      expect(data.query).toEqual({})
      expect(data.headers).toEqual(expectedHeaders)
    })
  })

  methods.forEach((method) => {
    it(`${method.toUpperCase()} /bodyquery/{id}`, async () => {
      const fun = fetcher
        .path('/bodyquery/{id}')
        .method(method)
        .create({ scalar: 1 })

      const { data } = await fun({
        id: 1,
        scalar: 'a',
        list: ['b', 'c'],
      })

      expect(data.params).toEqual({ id: '1' })
      expect(data.body).toEqual({ list: ['b', 'c'] })
      expect(data.query).toEqual({ scalar: 'a' })
      expect(data.headers).toEqual(expectedHeaders)
    })
  })

  it('GET /error', async () => {
    expect.assertions(1)

    const fun = fetcher.path('/error').method('get').create()

    try {
      await fun({})
    } catch (err) {
      if (err instanceof ApiError) {
        expect(err).toMatchObject({
          status: 400,
          statusText: 'Bad Request',
          data: '',
        })
      }
    }
  })

  it('GET /error (json body)', async () => {
    expect.assertions(1)

    const fun = fetcher.path('/error').method('get').create()

    try {
      await fun({ detail: true })
    } catch (e) {
      if (e instanceof ApiError) {
        expect(e).toMatchObject({
          status: 400,
          statusText: 'Bad Request',
          data: {
            message: 'Really Bad Request',
          },
        })
      }
    }
  })

  it('override init', async () => {
    const fun = fetcher.path('/query/{a}/{b}').method('get').create()

    const { data } = await fun(
      {
        a: 1,
        b: 2,
        scalar: 'a',
        list: ['b', 'c'],
      },
      {
        headers: { admin: 'true' },
        credentials: 'include',
      },
    )

    expect(data.headers).toEqual({ ...expectedHeaders, admin: 'true' })
  })

  it('use middleware', async () => {
    const fun = fetcher
      .path('/bodyquery/{id}')
      .method('post')
      .create({ scalar: 1 })

    const captured = { url: '', body: '' }

    fetcher.use(async (url, init, next) => {
      init.headers.set('mw1', 'true')

      captured.url = url
      captured.body = init.body as string

      const response = await next(url, init)
      const data = response.data as Data
      data.body.list.push('mw1')

      return response
    })

    fetcher.use(async (url, init, next) => {
      const response = await next(url, init)
      const data = response.data as Data
      data.body.list.push('mw2')
      return response
    })

    const { data } = await fun({
      id: 1,
      scalar: 'a',
      list: ['b', 'c'],
    })

    expect(data.body.list).toEqual(['b', 'c', 'mw2', 'mw1'])
    expect(data.headers.mw1).toEqual('true')
    expect(captured.url).toEqual('https://api.backend.dev/bodyquery/1?scalar=a')
    expect(captured.body).toEqual('{"list":["b","c"]}')
  })

  it('typecheck complex api', () => {
    const stripe = Fetcher.for<stripePaths>()

    const createAccount = stripe.path('/v1/account').method('post').create()

    type Arg = FetchArgType<typeof createAccount>
    type Ret = FetchReturnType<typeof createAccount>

    const arg: Arg = {}
    const ret: Ret = {} as any

    // just typechecking
    expect(arg.company).toBeUndefined()
    expect(ret.company).toBeUndefined()
  })
})
