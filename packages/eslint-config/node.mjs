// Node-specific ESLint preset (apps/api). Extends base + adds Node globals and the
// architecture rule that mongoose can only be imported from repository files.

import globals from 'globals';

import base from './base.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Architectural rule: mongoose models must not leak out of the repository layer.
      // The repository pattern is enforced at build time, not at code review.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'mongoose',
              message:
                'Mongoose may only be imported from *.repository.ts files. Use the repository layer.',
            },
          ],
          patterns: [
            {
              group: ['**/*.model', '**/*.model.js', '**/*.model.ts'],
              message:
                'Mongoose models may only be imported from the matching *.repository.ts file.',
            },
          ],
        },
      ],
    },
  },
  {
    // Allow mongoose / *.model imports inside repository files (the only place they belong).
    files: ['**/*.repository.ts', '**/*.model.ts', '**/db/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];
