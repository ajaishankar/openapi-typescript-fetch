/* eslint-disable @typescript-eslint/ban-types */
export type Data = {
  params: string[]
  headers: Record<string, string>
  query: Record<string, string | string[]>
  body: any
}

type Query = {
  parameters: {
    path: { a: number; b: string }
    query: { scalar: string; list: string[]; optional?: string }
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

type BodyArray = {
  parameters: {
    path: { id: number }
    body: { payload: string[] }
  }
  responses: { 200: { schema: Data } }
}

type BodyAndQuery = {
  parameters: {
    path: { id: number }
    query: { scalar: string; optional?: string }
    body: { payload: { list: string[] } }
  }
  responses: { 201: { schema: Data } }
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
  '/bodyarray/{id}': {
    post: BodyArray
    put: BodyArray
    patch: BodyArray
    delete: BodyArray
  }
  '/bodyquery/{id}': {
    post: BodyAndQuery
    put: BodyAndQuery
    patch: BodyAndQuery
    delete: BodyAndQuery
  }
  '/nocontent': {
    post: {
      parameters: {}
      responses: {
        204: unknown
      }
    }
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
  '/defaulterror': {
    get: {
      parameters: {}
      responses: {}
    }
  }
  '/networkerror': {
    get: {
      parameters: {}
      responses: {
        default: string
      }
    }
  }
}
