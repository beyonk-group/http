import { defineConfig } from 'tsup'

export default defineConfig(
  {
    entry: [ 'lib/index.js' ],
    format: [ 'esm', 'cjs' ],
    target: 'es2023',
    dts: true,
    sourcemap: false,
    clean: true
  }
)
