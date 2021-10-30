export type Data = {
  params: string[]
  headers: Record<string, string>
  query: Record<string, string | string[]>
  body: Record<string, any>
}

type Query = {
  parameters: {
    path: { a: number; b: string }
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
  '/error/{status}': {
    get: {
      parameters: {
        path: { status: number }
        query: { detail?: boolean }
      }
      responses: {
        400: {
          schema: { badRequest: boolean } // openapi 2
        }
        500: {
          content: {
            'application/json': { internalServer: boolean } // openapi 3
          }
        }
        default: { message: string }
      }
    }
  }
  '/networkerror': {
    get: {
      // eslint-disable-next-line @typescript-eslint/ban-types
      parameters: {}
      responses: {
        default: string
      }
    }
  }
}
