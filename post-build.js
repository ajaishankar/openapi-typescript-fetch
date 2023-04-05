import { writeFile } from 'node:fs/promises'

writeFile(
  'dist/cjs/package.json',
  JSON.stringify({ type: 'commonjs' }, null, 4),
).catch(console.error.bind(console))
