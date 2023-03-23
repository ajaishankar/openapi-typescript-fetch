import { exec } from 'node:child_process'
import { promisify } from 'node:util'

export const execPromise = promisify(exec)

const PS1 = `
Dir ./dist/cjs/*.js | Rename-Item -NewName { [io.path]::ChangeExtension($_.Name,"cjs") };
Copy-Item ./dist/esm/index.d.ts ./dist/index.d.ts;
`

const BASH = `
for file in dist/cjs/*.js; do
mv "$file" "\${file%.js}.cjs"
done;
cp dist/esm/index.d.ts ./dist/index.d.ts
`

/* 
  ? Wonder if we can get away with only 1 instead of 3 
  - PS1 --------------------------------
  // Remove-Item ./dist/cjs/index.d.ts ./dist/index.d.ts;
  // Remove-Item ./dist/esm/index.d.ts
  - BASH --------------------------------
  // mv dist/cjs/index.d.ts dist/index.d.ts;
  // rm -f dist/esm/index.d.ts;
*/

async function execTokens(ps1, bash) {
  const args =
    process.platform === 'win32' ? [ps1, { shell: 'powershell' }] : [bash]

  try {
    await execPromise(...args)
  } catch (e) {
    throw e
  }
}

execTokens(PS1, BASH)
