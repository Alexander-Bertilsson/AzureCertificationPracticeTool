import type { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '../../theme/theme-context';

export interface ThemedMarkdownProps {
  children: string;
  onLinkPress?: (url: string) => boolean;
}

export function ThemedMarkdown({ children, onLinkPress }: ThemedMarkdownProps): React.JSX.Element {
  const theme = useTheme();

  const style: StyleSheet.NamedStyles<Record<string, ViewStyle | TextStyle>> = {
    body: {
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
      lineHeight: theme.fontSize.md * theme.lineHeight.relaxed,
    },
    heading1: {
      color: theme.colors.text,
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.semibold,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    heading2: {
      color: theme.colors.text,
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.semibold,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    heading3: {
      color: theme.colors.text,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: theme.spacing.md,
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    code_inline: {
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.text,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      fontSize: theme.fontSize.sm,
    },
    code_block: {
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.text,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      fontSize: theme.fontSize.sm,
    },
    fence: {
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.text,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      fontSize: theme.fontSize.sm,
    },
    bullet_list: {
      marginBottom: theme.spacing.md,
    },
    ordered_list: {
      marginBottom: theme.spacing.md,
    },
    list_item: {
      marginBottom: theme.spacing.xs,
    },
    blockquote: {
      backgroundColor: theme.colors.surfaceMuted,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
  };

  return onLinkPress !== undefined ? (
    <Markdown style={style} onLinkPress={onLinkPress}>
      {children}
    </Markdown>
  ) : (
    <Markdown style={style}>{children}</Markdown>
  );
}
