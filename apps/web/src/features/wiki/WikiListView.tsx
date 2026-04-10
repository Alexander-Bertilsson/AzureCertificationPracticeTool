import type { Topic, TopicId, WikiArticle } from '@acpt/shared';
import { Link } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

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
        backgroundColor: theme.colors.background,
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingVertical: theme.spacing.xxxl,
      }}
      testID="wiki-list-screen"
    >
      <View style={{ maxWidth: 1100, width: '100%', alignSelf: 'center' }}>
        <Stack gap="xxl">
          <Stack gap="sm">
            <Badge label="Wiki Library" tone="info" />
            <Heading level={1}>Azure study wiki</Heading>
            <BodyText variant="muted">
              Bite-sized articles, grouped by topic. Pick an article to read.
            </BodyText>
          </Stack>

          {state.status === 'loading' ? <Spinner label="Loading wiki" /> : null}

          {state.status === 'error' ? (
            <Card elevated>
              <Stack gap="xs">
                <Heading level={3}>Couldn&apos;t load the wiki</Heading>
                <BodyText variant="muted">{state.message}</BodyText>
              </Stack>
            </Card>
          ) : null}

          {state.status === 'success'
            ? groupArticlesByTopic(state.topics, state.articles).map(
                ({ topic, articles }, index) => (
                  <Stack key={topic.id} gap="lg">
                    <Stack gap="xs">
                      <BodyText
                        variant="small"
                        style={{
                          color: theme.colors.tertiary,
                          fontWeight: theme.fontWeight.bold,
                          letterSpacing: 0.6,
                          textTransform: 'uppercase',
                        }}
                      >
                        {`Topic ${String(index + 1).padStart(2, '0')}`}
                      </BodyText>
                      <Heading level={2}>{topic.title}</Heading>
                      <BodyText variant="muted">{topic.description}</BodyText>
                    </Stack>

                    {articles.length === 0 ? (
                      <Card elevated>
                        <BodyText variant="muted">No articles for this topic yet.</BodyText>
                      </Card>
                    ) : (
                      <Stack gap="md">
                        {articles.map((article) => (
                          <Link
                            key={article.id}
                            href={`/cert/${article.certificationId}/wiki/${article.id}`}
                            asChild
                          >
                            <Pressable testID={`wiki-card-${article.slug}`}>
                              <Card padding="xl" radius="xl" elevated>
                                <Stack gap="sm">
                                  <Row justify="space-between" align="flex-start">
                                    <View style={{ flex: 1 }}>
                                      <Heading level={3}>{article.title}</Heading>
                                    </View>
                                    <Badge
                                      label={`${String(article.readingTimeMinutes)} min read`}
                                      tone="success"
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
                ),
              )
            : null}
        </Stack>
      </View>
    </ScrollView>
  );
}
