import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';
import type { FontSizeToken } from '../theme/tokens';

export type HeadingLevel = 1 | 2 | 3;

interface LevelStyle {
  size: FontSizeToken;
  weight: '600' | '700' | '800';
  letterSpacing: number;
}

const LEVEL_STYLES: Record<HeadingLevel, LevelStyle> = {
  1: { size: 'xxxl', weight: '800', letterSpacing: -0.8 },
  2: { size: 'xxl', weight: '700', letterSpacing: -0.4 },
  3: { size: 'lg', weight: '700', letterSpacing: -0.1 },
};

export interface HeadingProps {
  children: ReactNode;
  level?: HeadingLevel;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export function Heading({ children, level = 1, style, testID }: HeadingProps): React.JSX.Element {
  const theme = useTheme();
  const levelStyle = LEVEL_STYLES[level];
  const fontSize = theme.fontSize[levelStyle.size];

  const base: TextStyle = {
    color: theme.colors.text,
    fontSize,
    fontWeight: levelStyle.weight,
    letterSpacing: levelStyle.letterSpacing,
    lineHeight: fontSize * theme.lineHeight.tight,
  };

  return (
    <Text testID={testID} accessibilityRole="header" aria-level={level} style={[base, style]}>
      {children}
    </Text>
  );
}
