import type { Topic, TopicId, WikiArticle } from '@acpt/shared';
import { Link } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';

import { Badge } from '../../components/Badge';
import { BodyText } from '../../components/BodyText';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Row } from '../../components/Row';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';

export type WikiListViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'success';
      topics: readonly Topic[];
      articles: readonly WikiArticle[];
    };

export interface WikiListViewProps {
  state: WikiListViewState;
}

function groupArticlesByTopic(
  topics: readonly Topic[],
  articles: readonly WikiArticle[],
): readonly { topic: Topic; articles: readonly WikiArticle[] }[] {
  const byTopic = new Map<TopicId, WikiArticle[]>();
  for (const article of articles) {
    const list = byTopic.get(article.topicId) ?? [];
    list.push(article);
    byTopic.set(article.topicId, list);
  }
  return [...topics]
    .sort((a, b) => a.order - b.order)
    .map((topic) => ({
      topic,
      articles: byTopic.get(topic.id) ?? [],
    }));
}

export function WikiListView({ state }: WikiListViewProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
      testID="wiki-list-screen"
    >
      <Stack gap="xl">
        <Stack gap="xs">
          <Heading level={1}>Wiki</Heading>
          <BodyText variant="muted">Bite-sized articles, grouped by topic.</BodyText>
        </Stack>

        {state.status === 'loading' ? <Spinner label="Loading wiki" /> : null}

        {state.status === 'error' ? (
          <Card>
            <Stack gap="xs">
              <Heading level={3}>Couldn&apos;t load the wiki</Heading>
              <BodyText variant="muted">{state.message}</BodyText>
            </Stack>
          </Card>
        ) : null}

        {state.status === 'success'
          ? groupArticlesByTopic(state.topics, state.articles).map(({ topic, articles }) => (
              <Stack key={topic.id} gap="md">
                <Stack gap="xs">
                  <Heading level={2}>{topic.title}</Heading>
                  <BodyText variant="muted">{topic.description}</BodyText>
                </Stack>

                {articles.length === 0 ? (
                  <Card>
                    <BodyText variant="muted">No articles for this topic yet.</BodyText>
                  </Card>
                ) : (
                  <Stack gap="sm">
                    {articles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/cert/${article.certificationId}/wiki/${article.id}`}
                        asChild
                      >
                        <Pressable testID={`wiki-card-${article.slug}`}>
                          <Card padding="md">
                            <Stack gap="xs">
                              <Row justify="space-between" align="flex-start">
                                <Heading level={3}>{article.title}</Heading>
                                <Badge
                                  label={`${String(article.readingTimeMinutes)} min`}
                                  tone="neutral"
                                />
                              </Row>
                              <BodyText variant="muted">{article.summary}</BodyText>
                            </Stack>
                          </Card>
                        </Pressable>
                      </Link>
                    ))}
                  </Stack>
                )}
              </Stack>
            ))
          : null}
      </Stack>
    </ScrollView>
  );
}
