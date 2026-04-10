import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';
import type { SpacingToken } from '../theme/tokens';

export interface CardProps {
  children: ReactNode;
  padding?: SpacingToken;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({ children, padding = 'lg', style, testID }: CardProps): React.JSX.Element {
  const theme = useTheme();

  const base: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[padding],
  };

  return (
    <View testID={testID} style={[base, style]}>
      {children}
    </View>
  );
}
