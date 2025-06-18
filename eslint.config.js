import mocha from '@beyonk/eslint-config/mocha'
import recommended from '@beyonk/eslint-config/recommended'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...globalIgnores('dist'),
  ...recommended,
  ...mocha,
  {
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module'
    }
  }
])
