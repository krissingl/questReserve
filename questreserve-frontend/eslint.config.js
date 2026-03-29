import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist']),

  // ---------------------------------------------------------------------------
  // Main config — applies to all TS/TSX files
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Prohibit any usage — use unknown instead for error catches and untyped data
      '@typescript-eslint/no-explicit-any': 'error',

      // Enforce API layer isolation:
      // Direct axios or fetch usage is only permitted in src/api/.
      // All other files must use functions from the domain API modules (auth.api.ts, etc.).
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['axios', 'axios/*'],
              message:
                'Direct axios imports are not allowed outside src/api/. Use the apiClient from @/api/client instead.',
            },
          ],
          paths: [
            {
              name: 'node-fetch',
              message:
                'Direct fetch usage is not allowed outside src/api/. Use the apiClient from @/api/client instead.',
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // src/api/ override — axios is permitted inside the API layer
  // ---------------------------------------------------------------------------
  {
    files: ['src/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
])
