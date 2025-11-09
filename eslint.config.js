import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // 🟢 Disable all common yellow/red lines
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-console': 'off',

      // 🟡 Disable warnings for dependency arrays in useEffect
      'react-hooks/exhaustive-deps': 'off',

      // 🟢 Keep only essential React rules
      'react-hooks/rules-of-hooks': 'error',
    },
  },
])
