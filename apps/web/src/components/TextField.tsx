import { TextInput, View, Text, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/theme-context';

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  testID?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry = false,
  editable = true,
  autoCapitalize,
  keyboardType,
  testID,
}: TextFieldProps): React.JSX.Element {
  const theme = useTheme();
  const hasError = error !== undefined && error.length > 0;

  const labelStyle: TextStyle = {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  };

  const inputStyle: TextStyle = {
    borderWidth: 1,
    borderColor: hasError ? theme.colors.danger : theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    minHeight: 40,
  };

  const helperStyle: TextStyle = {
    color: hasError ? theme.colors.danger : theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  };

  const wrapperStyle: ViewStyle = {
    flexDirection: 'column',
  };

  const helperMessage = hasError ? error : helperText;

  return (
    <View style={wrapperStyle} testID={testID}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        editable={editable}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        accessibilityLabel={label}
        accessibilityHint={helperText}
        style={inputStyle}
      />
      {helperMessage !== undefined && helperMessage.length > 0 ? (
        <Text style={helperStyle}>{helperMessage}</Text>
      ) : null}
    </View>
  );
}
