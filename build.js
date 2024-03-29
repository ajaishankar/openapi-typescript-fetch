// https://janessagarrow.com/blog/typescript-and-esbuild/

const { build } = require("esbuild");
const { dependencies, peerDependencies } = require('./package.json');
const { Generator } = require('npm-dts');

new Generator({
  entry: 'index.ts',
  output: 'dist/index.d.ts',
}).generate();

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  external: Object.keys(dependencies ?? {}).concat(Object.keys(peerDependencies ?? {})),
};

build({
  ...sharedConfig,
  platform: 'node', // for CJS
  outfile: "dist/index.cjs",
});

build({
  ...sharedConfig,
  outfile: "dist/index.js",
  platform: 'neutral', // for ESM
  format: "esm",
});