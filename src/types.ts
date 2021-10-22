export type Method =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'head'
  | 'options'

export type OpenapiPaths<Paths> = {
  [P in keyof Paths]: {
    [M in Method]?: unknown
  }
}

export type OpArgType<OP> = OP extends {
  parameters: {
    path?: infer P
    query?: infer Q
    body?: infer B
  }
}
  ? P & Q & (B extends Record<string, unknown> ? B[keyof B] : unknown)
  : Record<string, never>

// openapi 2 response type
export type OpReturnType<OP> = OP extends {
  responses: {
    200: {
      schema: infer R
    }
  }
}
  ? R
  : OP extends {
      responses: {
        default: infer D
      }
    }
  ? D extends { schema: infer S }
    ? S
    : D
  : unknown

export type CustomRequestInit = Omit<RequestInit, 'headers'> & {
  readonly headers: Headers
}

export type Fetch = (
  url: string,
  init: CustomRequestInit,
) => Promise<ApiResponse>

export type TypedFetch<R, A> = (
  arg: A,
  init?: RequestInit,
) => Promise<ApiResponse<R>>

export type FetchArgType<F> = F extends TypedFetch<any, infer A> ? A : never

export type FetchReturnType<F> = F extends TypedFetch<infer R, any> ? R : never

type _CreateFetch<OP, Q = never> = [Q] extends [never]
  ? () => TypedFetch<OpReturnType<OP>, OpArgType<OP>>
  : (query: Q) => TypedFetch<OpReturnType<OP>, OpArgType<OP>>

export type CreateFetch<M, OP> = M extends 'post' | 'put' | 'patch'
  ? OP extends { parameters: { query: infer Q } }
    ? _CreateFetch<OP, { [K in keyof Q]: true | 1 }>
    : _CreateFetch<OP>
  : _CreateFetch<OP>

export type Middleware = (
  url: string,
  init: CustomRequestInit,
  next: Fetch,
) => Promise<ApiResponse>

export type FetchConfig = {
  baseUrl?: string
  init?: RequestInit
  use?: Middleware[]
}

export type Request = {
  baseUrl: string
  method: Method
  path: string
  queryParams: string[] // even if a post these will be sent in query
  payload: Record<string, unknown>
  init?: RequestInit
  fetch: Fetch
}

export type ApiResponse<R = any> = {
  readonly headers: Headers
  readonly url: string
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly data: R
}

export class ApiError extends Error {
  readonly headers: Headers
  readonly url: string
  readonly status: number
  readonly statusText: string
  readonly data: any

  constructor(response: ApiResponse) {
    super(response.statusText)
    Object.setPrototypeOf(this, new.target.prototype)

    this.headers = response.headers
    this.url = response.url
    this.status = response.status
    this.statusText = response.statusText
    this.data = response.data
  }
}
