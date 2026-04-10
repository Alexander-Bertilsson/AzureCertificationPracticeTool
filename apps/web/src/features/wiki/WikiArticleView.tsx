import type { WikiArticle } from '@acpt/shared';
import { Linking, ScrollView, View } from 'react-native';

import { Badge } from '../../components/Badge';
import { BodyText } from '../../components/BodyText';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Row } from '../../components/Row';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';

import { ThemedMarkdown } from './ThemedMarkdown';

export type WikiArticleViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; article: WikiArticle };

export interface WikiArticleViewProps {
  state: WikiArticleViewState;
}

function handleLinkPress(url: string): boolean {
  void Linking.openURL(url);
  return true;
}

export function WikiArticleView({ state }: WikiArticleViewProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: theme.colors.background,
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingVertical: theme.spacing.xxxl,
      }}
      testID="wiki-article-screen"
    >
      <View style={{ maxWidth: 860, width: '100%', alignSelf: 'center' }}>
        {state.status === 'loading' ? <Spinner label="Loading article" /> : null}

        {state.status === 'error' ? (
          <Card elevated>
            <Stack gap="xs">
              <Heading level={3}>Couldn&apos;t load this article</Heading>
              <BodyText variant="muted">{state.message}</BodyText>
            </Stack>
          </Card>
        ) : null}

        {state.status === 'success' ? (
          <Stack gap="xl">
            <Stack gap="md">
              <Badge label="Wiki Article" tone="info" />
              <Heading level={1}>{state.article.title}</Heading>
              <Row gap="sm" align="center" wrap>
                <Badge
                  label={`${String(state.article.readingTimeMinutes)} min read`}
                  tone="success"
                />
                {state.article.tags.map((tag) => (
                  <Badge key={tag} label={tag} tone="info" />
                ))}
              </Row>
            </Stack>

            <View
              style={{
                backgroundColor: theme.colors.surfaceMuted,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.xl,
              }}
            >
              <BodyText style={{ fontSize: theme.fontSize.lg }}>{state.article.summary}</BodyText>
            </View>

            <ThemedMarkdown onLinkPress={handleLinkPress}>{state.article.body}</ThemedMarkdown>

            <Card tone="muted" padding="lg" radius="lg">
              <Stack gap="xs">
                <BodyText
                  variant="small"
                  style={{
                    color: theme.colors.textMuted,
                    fontWeight: theme.fontWeight.bold,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                  }}
                >
                  Source
                </BodyText>
                <BodyText variant="small" style={{ color: theme.colors.primary }}>
                  {state.article.sourceUrl}
                </BodyText>
              </Stack>
            </Card>
          </Stack>
        ) : null}
      </View>
    </ScrollView>
  );
}
