import 'whatwg-fetch'

import { server } from './mocks/server'
import { ApiError, arrayRequestBody, Fetcher } from '../src'
import { Data, paths } from './paths'

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
    accept: 'application/json',
  }

  const headersWithContentType = {
    ...expectedHeaders,
    'content-type': 'application/json',
  }

  it('GET /query/{a}/{b}', async () => {
    const fun = fetcher.path('/query/{a}/{b}').method('get').create()

    const { ok, status, statusText, data } = await fun({
      a: 1,
      b: '/',
      scalar: 'a',
      list: ['b', 'c'],
    })

    expect(data.params).toEqual({ a: '1', b: '%2F' })
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
      expect(data.headers).toEqual(headersWithContentType)
    })
  })

  methods.forEach((method) => {
    it(`${method.toUpperCase()} /bodyarray/{id}`, async () => {
      const fun = fetcher.path('/bodyarray/{id}').method(method).create()

      const { data } = await fun(arrayRequestBody(['b', 'c'], { id: 1 }))

      expect(data.params).toEqual({ id: '1' })
      expect(data.body).toEqual(['b', 'c'])
      expect(data.query).toEqual({})
      expect(data.headers).toEqual(headersWithContentType)
    })
  })

  methods.forEach((method) => {
    it(`${method.toUpperCase()} /bodyquery/{id}`, async () => {
      const fun = fetcher
        .path('/bodyquery/{id}')
        .method(method)
        .create({ scalar: 1, optional: 1 })

      const { data } = await fun({
        id: 1,
        scalar: 'a',
        list: ['b', 'c'],
      })

      expect(data.params).toEqual({ id: '1' })
      expect(data.body).toEqual({ list: ['b', 'c'] })
      expect(data.query).toEqual({ scalar: 'a' })
      expect(data.headers).toEqual(headersWithContentType)
    })
  })

  it(`DELETE /body/{id} (empty body)`, async () => {
    const fun = fetcher.path('/body/{id}').method('delete').create()

    const { data } = await fun({ id: 1 } as any)

    expect(data.params).toEqual({ id: '1' })
    expect(data.headers).toHaveProperty('accept')
    expect(data.headers).not.toHaveProperty('content-type')
  })

  it(`POST /nocontent`, async () => {
    const fun = fetcher.path('/nocontent').method('post').create()
    const { status, data } = await fun(undefined)
    expect(status).toBe(204)
    expect(data).toBeUndefined()
  })

  it('GET /error', async () => {
    expect.assertions(3)

    const fun = fetcher.path('/error/{status}').method('get').create()

    try {
      await fun({ status: 400 })
    } catch (err) {
      expect(err instanceof ApiError).toBe(true)
      expect(err instanceof fun.Error).toBe(true)

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
    const fun = fetcher.path('/error/{status}').method('get').create()

    const errors = {
      badRequest: false,
      internalServer: false,
      other: false,
    }

    const handleError = (e: any) => {
      if (e instanceof fun.Error) {
        const error = e.getActualType()
        // discriminated union
        if (error.status === 400) {
          errors.badRequest = error.data.badRequest
        } else if (error.status === 500) {
          errors.internalServer = error.data.internalServer
        } else {
          errors.other = error.data.message === 'unknown error'
        }
      }
    }

    for (const status of [400, 500, 503]) {
      try {
        await fun({ status, detail: true })
      } catch (e) {
        handleError(e)
      }
    }

    expect(errors).toEqual({
      badRequest: true,
      internalServer: true,
      other: true,
    })
  })
  it('default error type {status: number, data: any}', async () => {
    expect.assertions(2)

    const fun = fetcher.path('/defaulterror').method('get').create()

    try {
      await fun({})
    } catch (e) {
      if (e instanceof fun.Error) {
        const error = e.getActualType()
        expect(error.status).toBe(500)
        expect(error.data).toEqual('internal server error')
      }
    }
  })

  it('network error', async () => {
    expect.assertions(1)

    const fun = fetcher.path('/networkerror').method('get').create()

    try {
      await fun({})
    } catch (e) {
      expect(e).not.toBeInstanceOf(ApiError)
    }
  })

  it('operation specific error type', () => {
    const one = fetcher.path('/query/{a}/{b}').method('get').create()
    const two = fetcher.path('/body/{id}').method('post').create()

    expect(new one.Error({} as any)).not.toBeInstanceOf(two.Error)
    expect(new two.Error({} as any)).not.toBeInstanceOf(one.Error)
  })

  it('override init', async () => {
    const fun = fetcher.path('/query/{a}/{b}').method('get').create()

    const { data } = await fun(
      {
        a: 1,
        b: '2',
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

  it('middleware', async () => {
    const fun = fetcher
      .path('/bodyquery/{id}')
      .method('post')
      .create({ scalar: 1, optional: 1 })

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
})
