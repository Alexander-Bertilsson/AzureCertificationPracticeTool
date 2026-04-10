import type { WikiArticle } from '@acpt/shared';
import { Linking, ScrollView } from 'react-native';

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
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
      testID="wiki-article-screen"
    >
      {state.status === 'loading' ? <Spinner label="Loading article" /> : null}

      {state.status === 'error' ? (
        <Card>
          <Stack gap="xs">
            <Heading level={3}>Couldn&apos;t load this article</Heading>
            <BodyText variant="muted">{state.message}</BodyText>
          </Stack>
        </Card>
      ) : null}

      {state.status === 'success' ? (
        <Stack gap="lg">
          <Stack gap="sm">
            <Heading level={1}>{state.article.title}</Heading>
            <Row gap="sm" align="center" wrap>
              <Badge
                label={`${String(state.article.readingTimeMinutes)} min read`}
                tone="neutral"
              />
              {state.article.tags.map((tag) => (
                <Badge key={tag} label={tag} tone="info" />
              ))}
            </Row>
            <BodyText variant="muted">{state.article.summary}</BodyText>
          </Stack>

          <ThemedMarkdown onLinkPress={handleLinkPress}>{state.article.body}</ThemedMarkdown>

          <Card padding="md">
            <BodyText variant="small">
              Source: <BodyText variant="small">{state.article.sourceUrl}</BodyText>
            </BodyText>
          </Card>
        </Stack>
      ) : null}
    </ScrollView>
  );
}
