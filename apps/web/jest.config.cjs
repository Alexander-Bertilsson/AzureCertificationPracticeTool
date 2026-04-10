/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(test).ts?(x)'],
  // Mirror jest-expo's own transformIgnorePatterns (which leaves the expo-*
  // packages transformable) and add @tanstack/* for TanStack Query's ESM build.
  transformIgnorePatterns: [
    '/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@tanstack/.*)',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  clearMocks: true,
  restoreMocks: true,
};

module.exports = config;
