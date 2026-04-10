import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';
import type { FontSizeToken } from '../theme/tokens';

export type HeadingLevel = 1 | 2 | 3;

const LEVEL_TO_FONT_SIZE: Record<HeadingLevel, FontSizeToken> = {
  1: 'xxxl',
  2: 'xxl',
  3: 'xl',
};

export interface HeadingProps {
  children: ReactNode;
  level?: HeadingLevel;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export function Heading({ children, level = 1, style, testID }: HeadingProps): React.JSX.Element {
  const theme = useTheme();
  const token = LEVEL_TO_FONT_SIZE[level];
  const fontSize = theme.fontSize[token];

  const base: TextStyle = {
    color: theme.colors.text,
    fontSize,
    fontWeight: theme.fontWeight.semibold,
    lineHeight: fontSize * theme.lineHeight.tight,
  };

  return (
    <Text testID={testID} accessibilityRole="header" aria-level={level} style={[base, style]}>
      {children}
    </Text>
  );
}
