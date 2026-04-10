// Root flat ESLint config. Wires the shared presets from @acpt/eslint-config to the
// directories they apply to. typescript-eslint's projectService discovers the right
// tsconfig per file automatically.

import nodePreset from '@acpt/eslint-config/node';
import reactNativePreset from '@acpt/eslint-config/react-native';
import basePreset from '@acpt/eslint-config/base';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.expo/**',
      '**/*.tsbuildinfo',
      'pnpm-lock.yaml',
    ],
  },

  // packages/shared — pure TypeScript, base preset only.
  {
    files: ['packages/shared/**/*.{ts,tsx}'],
    ...basePreset[0],
  },
  ...basePreset.slice(1).map((cfg) => ({
    files: ['packages/shared/**/*.{ts,tsx}'],
    ...cfg,
  })),

  // apps/api — Node preset (adds repository-layer mongoose enforcement).
  ...nodePreset.map((cfg) => ({
    files: ['apps/api/**/*.{ts,tsx}'],
    ...cfg,
  })),

  // apps/web — React Native / Expo preset.
  ...reactNativePreset.map((cfg) => ({
    files: ['apps/web/**/*.{ts,tsx}'],
    ...cfg,
  })),
];
