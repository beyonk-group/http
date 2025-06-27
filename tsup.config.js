import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: [ 'lib/index.js' ],
    format: [ 'esm', 'cjs' ],
    target: [ 'es2023', 'node20' ],
    dts: true,
    sourcemap: false,
    clean: true,
    treeshake: false,
    esbuildOptions (options) {
      options.packages = 'external'
    }
  },
  // {
  //   entry: [ 'lib/index.cjs' ],
  //   format: [ 'cjs' ],
  //   target: 'node18',
  //   dts: true,
  //   sourcemap: false,
  //   clean: true,
  //   cjsInterop: true,
  // }
])
