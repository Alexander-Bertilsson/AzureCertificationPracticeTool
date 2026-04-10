// Design tokens for the web app, based on the "Architectural Cloud" design
// system in docs/Design/Design.md. Colors follow the Material 3 Azure palette.
//
// Surface hierarchy (tonal lift, no borders):
//   background  (#f9f9f9)  — page
//   surface     (#ffffff)  — lifted cards (surface-container-lowest)
//   surfaceMuted (#f3f3f3) — nested subtle sections (surface-container-low)
//   surfaceSunken (#e8e8e8) — input backgrounds, chip backgrounds
//
// The palette extends Material's token names with a few `-fixed` / container
// roles so the UI can lean on background color shifts for separation instead
// of 1px borders.

export const tokens = {
  colors: {
    // Surfaces / backgrounds
    background: '#f9f9f9',
    surface: '#ffffff',
    surfaceMuted: '#f3f3f3',
    surfaceSunken: '#e8e8e8',
    surfaceHighest: '#e2e2e2',

    // Borders (kept for edge cases — the design prefers color shifts)
    border: '#c0c7d4',
    borderStrong: '#717783',

    // Text
    text: '#1a1c1c',
    textMuted: '#404752',
    textInverse: '#ffffff',

    // Primary (Azure blue)
    primary: '#005faa',
    primaryPressed: '#004883',
    primaryContainer: '#0078d4',
    primaryMuted: '#d3e3ff', // primary-fixed
    onPrimaryFixedVariant: '#004883',

    // Secondary (lighter blue accents, used on progress bars)
    secondary: '#00658d',
    secondaryContainer: '#2fbcfe',
    secondaryFixed: '#c6e7ff',
    onSecondaryFixedVariant: '#004c6b',

    // Tertiary (teal — "success" / completion)
    tertiary: '#00677a',
    tertiaryContainer: '#008299',
    tertiaryFixed: '#aeecff',
    onTertiaryFixedVariant: '#004e5d',

    // Status
    success: '#00677a', // alias for tertiary
    danger: '#ba1a1a',
    dangerPressed: '#93000a',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    warning: '#d97706',

    // Focus ring (primary-fixed-dim)
    focusRing: '#a3c9ff',
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
    xl: 20,
    xxl: 32,
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
    display: 44,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.6,
  },
  // Ambient shadow ("Cloud Shadow") from Design.md §4.
  shadow: {
    ambient: {
      shadowColor: '#1a1c1c',
      shadowOpacity: 0.04,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 12 },
      elevation: 2,
    },
    ambientHover: {
      shadowColor: '#1a1c1c',
      shadowOpacity: 0.08,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 12 },
      elevation: 4,
    },
  },
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof Tokens['colors'];
export type SpacingToken = keyof Tokens['spacing'];
export type RadiusToken = keyof Tokens['radius'];
export type FontSizeToken = keyof Tokens['fontSize'];
export type FontWeightToken = keyof Tokens['fontWeight'];
