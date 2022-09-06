export default function explodeQueryFormStyle(
  acc: string[],
  prefix: string,
  params: unknown,
): string[] {
  if (params == null) {
    return acc
  }

  if (Array.isArray(params)) {
    return acc.concat(
      params.flatMap((param, i) =>
        explodeQueryFormStyle(
          acc,
          typeof param === 'object' ? `${prefix}[${i}]` : prefix,
          param,
        ),
      ),
    )
  }

  if (typeof params === 'object') {
    return Object.entries(params || {}).flatMap(([key, value]) => {
      return explodeQueryFormStyle(
        acc,
        prefix
          ? `${prefix}[${encodeURIComponent(key)}]`
          : encodeURIComponent(key),
        value,
      )
    })
  }

  const encodedTerminalValue = encodeURIComponent(String(params))
  return prefix ? [`${prefix}=${encodedTerminalValue}`] : [encodedTerminalValue]
}
