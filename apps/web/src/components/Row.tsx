import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';
import type { SpacingToken } from '../theme/tokens';

export type RowAlign = 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
export type RowJustify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';

export interface RowProps {
  children: ReactNode;
  gap?: SpacingToken;
  align?: RowAlign;
  justify?: RowJustify;
  padding?: SpacingToken;
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Row({
  children,
  gap = 'md',
  align = 'center',
  justify,
  padding,
  wrap,
  style,
  testID,
}: RowProps): React.JSX.Element {
  const theme = useTheme();

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: align,
    gap: theme.spacing[gap],
  };
  if (justify !== undefined) baseStyle.justifyContent = justify;
  if (padding !== undefined) baseStyle.padding = theme.spacing[padding];
  if (wrap === true) baseStyle.flexWrap = 'wrap';

  return (
    <View testID={testID} style={[baseStyle, style]}>
      {children}
    </View>
  );
}
