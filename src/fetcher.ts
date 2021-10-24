import {
  ApiError,
  ApiResponse,
  CreateFetch,
  CustomRequestInit,
  Fetch,
  FetchConfig,
  Method,
  Middleware,
  OpenapiPaths,
  Request,
} from './types'

const sendBody = (method: Method) =>
  method === 'post' ||
  method === 'put' ||
  method === 'patch' ||
  method === 'delete'

function queryString(params: Record<string, unknown>): string {
  const qs: string[] = []

  const encode = (key: string, value: unknown) =>
    `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`

  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value != null) {
      if (Array.isArray(value)) {
        value.forEach((value) => qs.push(encode(key, value)))
      } else {
        qs.push(encode(key, value))
      }
    }
  })

  if (qs.length > 0) {
    return `?${qs.join('&')}`
  }

  return ''
}

function getPath(path: string, payload: Record<string, any>) {
  return path.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = payload[key]
    delete payload[key]
    return value
  })
}

function getQuery(
  method: Method,
  payload: Record<string, any>,
  query: string[],
) {
  let queryObj = {} as any

  if (sendBody(method)) {
    query.forEach((key) => {
      queryObj[key] = payload[key]
      delete payload[key]
    })
  } else {
    queryObj = { ...payload }
  }

  return queryString(queryObj)
}

function getHeaders(init?: HeadersInit) {
  const headers = new Headers(init)

  if (!headers.has('Content-Type')) {
    headers.append('Content-Type', 'application/json')
  }

  if (!headers.has('Accept')) {
    headers.append('Accept', 'application/json')
  }

  return headers
}

function getBody(method: Method, payload: Record<string, unknown>) {
  const body = sendBody(method) ? JSON.stringify(payload) : undefined
  // if delete don't send body if empty
  return method === 'delete' && body === '{}' ? undefined : body
}

function mergeRequestInit(
  first?: RequestInit,
  second?: RequestInit,
): RequestInit {
  const headers = new Headers(first?.headers)
  const other = new Headers(second?.headers)

  for (const key of other.keys()) {
    const value = other.get(key)
    if (value != null) {
      headers.set(key, value)
    }
  }
  return { ...first, ...second, headers }
}

function getFetchParams(request: Request) {
  const payload = { ...request.payload } // clone payload

  const path = getPath(request.path, payload)
  const query = getQuery(request.method, payload, request.queryParams)
  const headers = getHeaders(request.init?.headers)
  const url = request.baseUrl + path + query

  const init = {
    ...request.init,
    method: request.method.toUpperCase(),
    headers,
    body: getBody(request.method, payload),
  }

  return { url, init }
}

async function getResponseData(response: Response) {
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return await response.json()
  }
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    return text
  }
}

async function fetchJson(url: string, init: RequestInit): Promise<ApiResponse> {
  const response = await fetch(url, init)

  const data = await getResponseData(response)

  const result = {
    headers: response.headers,
    url: response.url,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data,
  }

  if (result.ok) {
    return result
  }

  throw new ApiError(result)
}

function wrapMiddlewares(middlewares: Middleware[], fetch: Fetch): Fetch {
  type Handler = (
    index: number,
    url: string,
    init: CustomRequestInit,
  ) => Promise<ApiResponse>

  const handler: Handler = async (index, url, init) => {
    if (middlewares == null || index === middlewares.length) {
      return fetch(url, init)
    }
    const current = middlewares[index]
    init = init || { headers: getHeaders() }
    return await current(url, init, (nextUrl, nextInit) =>
      handler(index + 1, nextUrl, nextInit),
    )
  }

  return (url, init) => handler(0, url, init)
}

async function fetchUrl<R>(request: Request) {
  const { url, init } = getFetchParams(request)

  const response = await request.fetch(url, init)

  return response as ApiResponse<R>
}

function fetcher<Paths>() {
  let baseUrl = ''
  let defaultInit: RequestInit = {}
  const middlewares: Middleware[] = []
  const fetch = wrapMiddlewares(middlewares, fetchJson)

  return {
    configure: (config: FetchConfig) => {
      baseUrl = config.baseUrl || ''
      defaultInit = config.init || {}
      middlewares.splice(0)
      middlewares.push(...(config.use || []))
    },
    use: (mw: Middleware) => middlewares.push(mw),
    path: <P extends keyof Paths>(path: P) => ({
      method: <M extends keyof Paths[P]>(method: M) => ({
        create: ((queryParams?: Record<string, true | 1>) => (payload, init) =>
          fetchUrl({
            baseUrl: baseUrl || '',
            path: path as string,
            method: method as Method,
            queryParams: Object.keys(queryParams || {}),
            payload,
            init: mergeRequestInit(defaultInit, init),
            fetch,
          })) as CreateFetch<M, Paths[P][M]>,
      }),
    }),
  }
}

export const Fetcher = {
  for: <Paths extends OpenapiPaths<Paths>>() => fetcher<Paths>(),
}
