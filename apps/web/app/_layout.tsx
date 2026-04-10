import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '../src/theme/theme-context';

export default function RootLayout(): React.JSX.Element {
  // Created inside useState so the QueryClient is stable across re-renders and
  // not shared between SSR/hydration boundaries when Expo's static web output
  // is enabled later.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: true }} />
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
