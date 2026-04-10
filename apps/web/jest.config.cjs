/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(test).ts?(x)'],
  // jest-expo's defaults already handle the sprawling RN/Expo transformIgnorePatterns,
  // but @tanstack/react-query and any other ESM-only deps must be added here.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack/.*)/)',
  ],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  clearMocks: true,
  restoreMocks: true,
};

module.exports = config;
