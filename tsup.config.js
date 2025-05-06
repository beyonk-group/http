import { defineConfig } from 'tsup'

export default defineConfig(
  {
    entry: [ 'lib/index.js' ],
    dts: true,
    sourcemap: false,
    clean: true
  }
)