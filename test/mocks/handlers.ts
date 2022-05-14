import { ResponseComposition, rest, RestContext, RestRequest } from 'msw'

function getQuery(req: RestRequest) {
  const { searchParams } = req.url
  const query = {} as any

  for (const key of searchParams.keys()) {
    const value = searchParams.getAll(key)
    query[key] = value.length === 1 ? value[0] : value.sort()
  }
  return query
}

function getHeaders(req: RestRequest) {
  const headers = {} as any
  req.headers.forEach((value, key) => {
    if (key !== 'cookie' && !key.startsWith('x-msw')) {
      headers[key] = value
    }
  })
  return headers
}

function getResult(
  req: RestRequest,
  res: ResponseComposition,
  ctx: RestContext,
) {
  return res(
    ctx.json({
      params: req.params,
      headers: getHeaders(req),
      query: getQuery(req),
      body: req.body,
    }),
  )
}

const HOST = 'https://api.backend.dev'

const methods = {
  withQuery: [rest.get(`${HOST}/query/:a/:b`, getResult)],
  withBody: ['post', 'put', 'patch', 'delete'].map((method) => {
    return (rest as any)[method](`${HOST}/body/:id`, getResult)
  }),
  withBodyArray: ['post', 'put', 'patch', 'delete'].map((method) => {
    return (rest as any)[method](`${HOST}/bodyarray/:id`, getResult)
  }),
  withBodyAndQuery: ['post', 'put', 'patch', 'delete'].map((method) => {
    return (rest as any)[method](`${HOST}/bodyquery/:id`, getResult)
  }),
  withError: [
    rest.get(`${HOST}/error/:status`, (req, res, ctx) => {
      const status = Number(req.params.status)
      const detail = req.url.searchParams.get('detail') === 'true'
      return detail
        ? res(
            ctx.status(status),
            status === 400
              ? ctx.json({ badRequest: true })
              : status === 500
              ? ctx.json({ internalServer: true })
              : ctx.json({ message: 'unknown error' }),
          )
        : res(ctx.status(status))
    }),
    rest.post(`${HOST}/nocontent`, (req, res, ctx) => {
      return res(ctx.status(204))
    }),
    rest.get(`${HOST}/defaulterror`, (req, res, ctx) => {
      return res(ctx.status(500), ctx.body('internal server error'))
    }),
    rest.get(`${HOST}/networkerror`, (req, res) => {
      return res.networkError('failed to connect')
    }),
  ],
}

export const handlers = [
  ...methods.withQuery,
  ...methods.withBody,
  ...methods.withBodyArray,
  ...methods.withBodyAndQuery,
  ...methods.withError,
]
