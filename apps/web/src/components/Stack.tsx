import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';
import type { SpacingToken } from '../theme/tokens';

export type StackAlign = 'stretch' | 'flex-start' | 'center' | 'flex-end';
export type StackJustify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';

export interface StackProps {
  children: ReactNode;
  gap?: SpacingToken;
  align?: StackAlign;
  justify?: StackJustify;
  padding?: SpacingToken;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Stack({
  children,
  gap = 'md',
  align,
  justify,
  padding,
  style,
  testID,
}: StackProps): React.JSX.Element {
  const theme = useTheme();

  const baseStyle: ViewStyle = {
    flexDirection: 'column',
    gap: theme.spacing[gap],
  };
  if (align !== undefined) baseStyle.alignItems = align;
  if (justify !== undefined) baseStyle.justifyContent = justify;
  if (padding !== undefined) baseStyle.padding = theme.spacing[padding];

  return (
    <View testID={testID} style={[baseStyle, style]}>
      {children}
    </View>
  );
}
