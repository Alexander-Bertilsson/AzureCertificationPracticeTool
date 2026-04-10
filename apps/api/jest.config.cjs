/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/test/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'cjs', 'json'],
  // NodeNext requires .js extensions in source imports; strip them for Jest's resolver.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: false, decorators: false },
          target: 'es2022',
        },
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts', '!src/scripts/**'],
  // Coverage thresholds enabled in feature module commits, not on the empty scaffold.
  clearMocks: true,
  restoreMocks: true,
  // mongodb-memory-server's first boot on Windows can take 10–20s. Default of 5s is
  // too tight for beforeAll hooks that start the in-memory mongod.
  testTimeout: 30000,
};

module.exports = config;
