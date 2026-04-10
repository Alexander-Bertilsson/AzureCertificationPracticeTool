import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';

export type SpinnerSize = 'small' | 'large';

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Spinner({
  size = 'small',
  label = 'Loading',
  style,
  testID,
}: SpinnerProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      testID={testID}
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <ActivityIndicator size={size} color={theme.colors.primary} />
    </View>
  );
}
