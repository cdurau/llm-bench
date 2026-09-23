import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintPluginReact from 'eslint-plugin-react'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      react: eslintPluginReact
    },
    rules: {
      ...eslintPluginReact.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
      'react/prop-types': 'off',
      'react/no-unknown-property': ['warn', { ignore: ['jsx'] }]
    }
  },
  // Test files - no project reference, disable unused vars checks
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**/*.ts', 'src/**/__tests__/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: false,
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-refresh/only-export-components': 'off'
    }
  },
  // All other TypeScript files in src/ (not in subdirectories that contain tests)
  // We match TypeScript files that don't have ".test." in their name
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**/*.ts', 'src/**/__tests__/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        vars: 'local',
        args: 'none',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-interface': ['warn', {
        allowSingleExtends: true
      }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.git/**']
  }
]
