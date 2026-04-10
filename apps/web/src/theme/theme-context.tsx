import { createContext, useContext, type ReactNode } from 'react';

import { tokens, type Tokens } from './tokens';

// The default value is the real tokens object so components render sensibly
// even when used outside a provider (e.g. in a bare test). In-app, every
// screen sits under ThemeProvider via app/_layout.tsx.
const ThemeContext = createContext<Tokens>(tokens);

export interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Tokens {
  return useContext(ThemeContext);
}
