import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';

export type BodyTextVariant = 'default' | 'muted' | 'small';

export interface BodyTextProps {
  children: ReactNode;
  variant?: BodyTextVariant;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export function BodyText({
  children,
  variant = 'default',
  style,
  testID,
}: BodyTextProps): React.JSX.Element {
  const theme = useTheme();
  const color = variant === 'muted' ? theme.colors.textMuted : theme.colors.text;
  const fontSize = variant === 'small' ? theme.fontSize.sm : theme.fontSize.md;

  const base: TextStyle = {
    color,
    fontSize,
    fontWeight: theme.fontWeight.regular,
    lineHeight: fontSize * theme.lineHeight.normal,
  };

  return (
    <Text testID={testID} style={[base, style]}>
      {children}
    </Text>
  );
}
