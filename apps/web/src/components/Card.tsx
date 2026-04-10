import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';
import type { RadiusToken, SpacingToken } from '../theme/tokens';

export type CardTone = 'surface' | 'muted' | 'sunken';

export interface CardProps {
  children: ReactNode;
  padding?: SpacingToken;
  radius?: RadiusToken;
  tone?: CardTone;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({
  children,
  padding = 'lg',
  radius = 'lg',
  tone = 'surface',
  elevated = false,
  style,
  testID,
}: CardProps): React.JSX.Element {
  const theme = useTheme();

  const backgroundColor =
    tone === 'surface'
      ? theme.colors.surface
      : tone === 'muted'
        ? theme.colors.surfaceMuted
        : theme.colors.surfaceSunken;

  const base: ViewStyle = {
    backgroundColor,
    borderRadius: theme.radius[radius],
    padding: theme.spacing[padding],
    ...(elevated ? theme.shadow.ambient : {}),
  };

  return (
    <View testID={testID} style={[base, style]}>
      {children}
    </View>
  );
}
