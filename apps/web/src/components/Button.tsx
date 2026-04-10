import {
  Pressable,
  Text,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/theme-context';
import type { Tokens } from '../theme/tokens';

// react-native-web passes `focused` through Pressable's state callback but
// @types/react-native doesn't model it yet, so we extend the type locally.
type PressableWebState = PressableStateCallbackType & { focused?: boolean };

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

interface VariantColors {
  background: string;
  backgroundPressed: string;
  backgroundHovered: string;
  text: string;
  border: string;
}

interface SizeStyle {
  paddingHorizontal: number;
  paddingVertical: number;
  fontSize: number;
  minHeight: number;
}

function getVariantColors(theme: Tokens, variant: ButtonVariant): VariantColors {
  switch (variant) {
    case 'primary':
      return {
        background: theme.colors.primary,
        backgroundPressed: theme.colors.primaryPressed,
        backgroundHovered: theme.colors.primaryPressed,
        text: theme.colors.textInverse,
        border: theme.colors.primary,
      };
    case 'secondary':
      return {
        background: theme.colors.surface,
        backgroundPressed: theme.colors.surfaceMuted,
        backgroundHovered: theme.colors.surfaceMuted,
        text: theme.colors.text,
        border: theme.colors.borderStrong,
      };
    case 'ghost':
      return {
        background: 'transparent',
        backgroundPressed: theme.colors.surfaceMuted,
        backgroundHovered: theme.colors.surfaceMuted,
        text: theme.colors.text,
        border: 'transparent',
      };
    case 'danger':
      return {
        background: theme.colors.danger,
        backgroundPressed: theme.colors.dangerPressed,
        backgroundHovered: theme.colors.dangerPressed,
        text: theme.colors.textInverse,
        border: theme.colors.danger,
      };
  }
}

function getSizeStyle(theme: Tokens, size: ButtonSize): SizeStyle {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        fontSize: theme.fontSize.sm,
        minHeight: 32,
      };
    case 'md':
      return {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        fontSize: theme.fontSize.md,
        minHeight: 40,
      };
    case 'lg':
      return {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        fontSize: theme.fontSize.lg,
        minHeight: 48,
      };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  testID,
}: ButtonProps): React.JSX.Element {
  const theme = useTheme();
  const colors = getVariantColors(theme, variant);
  const sizing = getSizeStyle(theme, size);

  const buildContainerStyle = (raw: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const state = raw as PressableWebState;
    const background = disabled
      ? theme.colors.surfaceMuted
      : state.pressed
        ? colors.backgroundPressed
        : state.hovered === true
          ? colors.backgroundHovered
          : colors.background;

    const style: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: theme.radius.md,
      backgroundColor: background,
      borderColor: disabled ? theme.colors.border : colors.border,
      paddingHorizontal: sizing.paddingHorizontal,
      paddingVertical: sizing.paddingVertical,
      minHeight: sizing.minHeight,
      opacity: disabled ? 0.6 : 1,
    };

    if (fullWidth) style.alignSelf = 'stretch';
    if (state.focused === true && !disabled) style.borderColor = theme.colors.focusRing;

    return style;
  };

  const textStyle: TextStyle = {
    color: disabled ? theme.colors.textMuted : colors.text,
    fontSize: sizing.fontSize,
    fontWeight: theme.fontWeight.semibold,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={buildContainerStyle}
      testID={testID}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}
