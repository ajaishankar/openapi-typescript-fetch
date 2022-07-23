import nodeResolve from '@rollup/plugin-node-resolve'
import typescriptPlugin from '@rollup/plugin-typescript'

import packageJson from './package.json'

/** @type{import('rollup').RollupOptions[]} */
const options = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.exports.require,
        format: 'cjs',
        entryFileNames: '[name].cjs',
      },
      {
        file: packageJson.exports.import,
        format: 'esm',
      },
    ],
    plugins: [
      nodeResolve({ resolveOnly: [/^\./] }),
      typescriptPlugin({
        tsconfig: './tsconfig.json',
      }),
    ],
  },
]

export default options
