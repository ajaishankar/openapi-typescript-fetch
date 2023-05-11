# @qdrant/openapi-typescript-fetch

## 1.2.0

### Minor Changes

- - Package `type=module` compatibility and exports entrypoint for cjs, es6 and esm
  - Do not send `content-type` header with empty body
  - Fix strictness of parameters in the query in the creator function
  - Enable `FormData` as body
  - Support 202 Accepted response type
  - Infer types for OAS3 using `application/json; charset=utf-8`
