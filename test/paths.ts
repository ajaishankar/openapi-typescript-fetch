export type Data = {
  params: string[]
  headers: Record<string, string>
  query: Record<string, string | string[]>
  body: Record<string, any>
}

type Query = {
  parameters: {
    path: { a: number; b: number }
    query: { scalar: string; list: string[] }
  }
  responses: { 200: { schema: Data } }
}

type Body = {
  parameters: {
    path: { id: number }
    body: { payload: { list: string[] } }
  }
  responses: { 200: { schema: Data } }
}

type BodyAndQuery = {
  parameters: {
    path: { id: number }
    query: { scalar: string }
    body: { payload: { list: string[] } }
  }
  responses: { 200: { schema: Data } }
}

export type paths = {
  '/query/{a}/{b}': {
    get: Query
  }
  '/body/{id}': {
    post: Body
    put: Body
    patch: Body
    delete: Body
  }
  '/bodyquery/{id}': {
    post: BodyAndQuery
    put: BodyAndQuery
    patch: BodyAndQuery
    delete: BodyAndQuery
  }
  '/error': {
    get: {
      parameters: {
        query: { detail?: boolean }
      }
      responses: {
        default: { message: string }
      }
    }
  }
}
