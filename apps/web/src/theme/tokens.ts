// Design tokens for the web app. Single light theme for now; ThemeProvider is
// wired so a dark theme can slot in without changing consumer code. Consumers
// reach these via `useTheme()` rather than importing directly, so that a future
// theme swap is transparent.

export const tokens = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    text: '#0F172A',
    textMuted: '#475569',
    textInverse: '#FFFFFF',
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    primaryMuted: '#DBEAFE',
    danger: '#DC2626',
    dangerPressed: '#B91C1C',
    success: '#16A34A',
    warning: '#D97706',
    focusRing: '#60A5FA',
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    pill: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof Tokens['colors'];
export type SpacingToken = keyof Tokens['spacing'];
export type RadiusToken = keyof Tokens['radius'];
export type FontSizeToken = keyof Tokens['fontSize'];
export type FontWeightToken = keyof Tokens['fontWeight'];
