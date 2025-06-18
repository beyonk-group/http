import recommended from '@beyonk/eslint-config/recommended'
import mocha from '@beyonk/eslint-config/mocha'

export default [
  ...recommended,
  ...mocha,
  {
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module'
    }
  }
]
