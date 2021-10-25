# 📘️ openapi-typescript-fetch

A typed fetch client for [openapi-typescript](https://github.com/drwpow/openapi-typescript) 

**Features**

Supports JSON request and responses

- ✅ [OpenAPI 3.0](https://swagger.io/specification)
- ✅ [Swagger 2.0](https://swagger.io/specification/v2/)

### Usage

**Generate typescript definition from schema**

```bash
npx openapi-typescript https://petstore.swagger.io/v2/swagger.json --output petstore.ts

# 🔭 Loading spec from https://petstore.swagger.io/v2/swagger.json…
# 🚀 https://petstore.swagger.io/v2/swagger.json -> petstore.ts [650ms]
```

**Typed fetch client**

```ts
import 'whatwg-fetch'

import { Fetcher } from 'openapi-typescript-fetch'

import { paths } from './petstore'

// declare fetcher for paths
const fetcher = Fetcher.for<paths>()

// global configuration
fetcher.configure({
  baseUrl: 'https://petstore.swagger.io/v2',
  init: {
    headers: {
      ...
    },
  },
  use: [...] // middewares
})

// create fetch operations
const findPetsByStatus = fetcher.path('/pet/findByStatus').method('get').create()
const addPet = fetcher.path('/pet').method('post').create()

// fetch
const { status, data: pets } = await findPetsByStatus({
  status: ['available', 'pending'],
})

console.log(pets[0])
```

### Middleware

Middlewares can be used to pre and post process fetch operations (log api calls, add auth headers etc)

```ts

import { Middleware } from 'openapi-typescript-fetch'

const logger: Middleware = async (url, init, next) => {
  console.log(`fetching ${url}`)
  const response = await next(url, init)
  console.log(`fetched ${url}`)
  return response
}

fetcher.configure({
  baseUrl: 'https://petstore.swagger.io/v2',
  init: { ... },
  use: [logger],
})

// or

fetcher.use(logger)
```

### Utility Types

- `OpArgType` - Infer argument type of an operation
- `OpReturnType` - Infer return type of an operation
- `FetchArgType` - Argument type of a typed fetch operation
- `FetchReturnType` - Return type of a typed fetch operation

```ts
import { paths, operations } from './petstore'

type Arg = OpArgType<operations['findPetsByStatus']>
type Ret = OpReturnType<operations['findPetsByStatus']>

type Arg = OpArgType<paths['/pet/findByStatus']['get']>
type Ret = OpReturnType<paths['/pet/findByStatus']['get']>

const findPetsByStatus = fetcher.path('/pet/findByStatus').method('get').create()

type Arg = FetchArgType<typeof findPetsByStatus>
type Ret = FetchReturnType<typeof findPetsByStatus>
```

Happy fetching! 👍