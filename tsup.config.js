import { defineConfig } from 'tsup'

export default defineConfig(
  {
    entry: [ 'lib/index.js' ],
    format: [ 'esm', 'cjs' ],
    dts: true,
    sourcemap: false,
    clean: true
  }
)
