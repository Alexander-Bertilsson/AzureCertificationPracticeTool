// React Native / Expo preset (apps/web).
//
// Built fresh (not extending base.mjs) so we can use non-type-aware
// typescript-eslint rules. Type-aware linting (strictTypeChecked) trips on
// react-native's Flow-typed index.js when typescript-eslint's projectService
// follows imports into node_modules. We pay a small safety cost to keep the
// lint loop fast and reliable for the web app — strict TS still runs via
// `tsc -b`, so we get the same type errors at typecheck time.

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'import-x': importX,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // --- TypeScript ---
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      // --- React ---
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // --- Imports ---
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'unused-imports/no-unused-imports': 'error',

      // --- Output discipline ---
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Expo Router files are required to use default exports.
    files: ['apps/web/app/**/*.{ts,tsx}'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  prettier,
);
