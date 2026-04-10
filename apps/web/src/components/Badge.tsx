import { Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';
import type { Tokens } from '../theme/tokens';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  testID?: string;
}

interface BadgeColors {
  background: string;
  text: string;
}

function getBadgeColors(theme: Tokens, tone: BadgeTone): BadgeColors {
  switch (tone) {
    case 'neutral':
      return {
        background: theme.colors.surfaceSunken,
        text: theme.colors.textMuted,
      };
    case 'info':
      return {
        background: theme.colors.primaryMuted,
        text: theme.colors.onPrimaryFixedVariant,
      };
    case 'success':
      return {
        background: theme.colors.tertiaryFixed,
        text: theme.colors.onTertiaryFixedVariant,
      };
    case 'warning':
      return {
        background: theme.colors.secondaryFixed,
        text: theme.colors.onSecondaryFixedVariant,
      };
    case 'danger':
      return {
        background: theme.colors.errorContainer,
        text: theme.colors.onErrorContainer,
      };
  }
}

export function Badge({ label, tone = 'neutral', testID }: BadgeProps): React.JSX.Element {
  const theme = useTheme();
  const colors = getBadgeColors(theme, tone);

  const containerStyle: ViewStyle = {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  };

  const textStyle: TextStyle = {
    color: colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.4,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}
