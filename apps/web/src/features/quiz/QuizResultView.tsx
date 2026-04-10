import type { PerTopicScore, QuizSession, Topic } from '@acpt/shared';
import { Link } from 'expo-router';
import { Pressable, ScrollView, View, type DimensionValue } from 'react-native';

import { Badge } from '../../components/Badge';
import { BodyText } from '../../components/BodyText';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Row } from '../../components/Row';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';

export type QuizResultViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; session: QuizSession; topics: readonly Topic[] };

export interface QuizResultViewProps {
  state: QuizResultViewState;
}

interface PerTopicRow {
  topicId: string;
  title: string;
  correct: number;
  total: number;
  accuracy: number;
}

function buildPerTopicRows(
  perTopic: PerTopicScore,
  topics: readonly Topic[],
): readonly PerTopicRow[] {
  const topicTitleById = new Map(topics.map((t) => [String(t.id), t.title]));
  return Object.entries(perTopic).map(([topicId, breakdown]) => ({
    topicId,
    title: topicTitleById.get(topicId) ?? topicId,
    correct: breakdown.correct,
    total: breakdown.total,
    accuracy: breakdown.total === 0 ? 0 : breakdown.correct / breakdown.total,
  }));
}

function formatPercent(ratio: number): string {
  return `${String(Math.round(ratio * 100))}%`;
}

export function QuizResultView({ state }: QuizResultViewProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: theme.colors.background,
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingVertical: theme.spacing.xxxl,
      }}
      testID="quiz-result-screen"
    >
      <View style={{ maxWidth: 1100, width: '100%', alignSelf: 'center' }}>
        {state.status === 'loading' ? <Spinner label="Finishing quiz" /> : null}

        {state.status === 'error' ? (
          <Card elevated>
            <Stack gap="xs">
              <Heading level={3}>Couldn&apos;t finish the quiz</Heading>
              <BodyText variant="muted">{state.message}</BodyText>
            </Stack>
          </Card>
        ) : null}

        {state.status === 'success' && state.session.score !== undefined
          ? (() => {
              const score = state.session.score;
              const overall = score.total === 0 ? 0 : score.correct / score.total;
              const rows = buildPerTopicRows(score.perTopic, state.topics);
              return (
                <Stack gap="xxl">
                  <Row gap="lg" wrap align="stretch">
                    <View style={{ flex: 2, minWidth: 320 }}>
                      <Card padding="xl" radius="xxl" elevated>
                        <Stack gap="md">
                          <Badge label="Final Results" tone="success" />
                          <Heading level={1}>Quiz complete.</Heading>
                          <BodyText variant="muted">
                            {state.session.feedbackMode === 'practice' ? 'Practice' : 'Exam'} mode,{' '}
                            {String(state.session.length)} questions.
                          </BodyText>
                        </Stack>
                      </Card>
                    </View>
                    <View style={{ flex: 1, minWidth: 260 }}>
                      <View
                        style={{
                          backgroundColor: theme.colors.primary,
                          borderRadius: theme.radius.xxl,
                          padding: theme.spacing.xl,
                          ...theme.shadow.ambient,
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 200,
                        }}
                      >
                        <BodyText
                          variant="small"
                          style={{
                            color: theme.colors.textInverse,
                            opacity: 0.8,
                            fontWeight: theme.fontWeight.bold,
                            letterSpacing: 0.6,
                            textTransform: 'uppercase',
                          }}
                        >
                          Overall Score
                        </BodyText>
                        <Heading
                          level={1}
                          style={{
                            color: theme.colors.textInverse,
                            fontSize: theme.fontSize.display,
                          }}
                        >
                          {formatPercent(overall)}
                        </Heading>
                        <BodyText
                          style={{
                            color: theme.colors.textInverse,
                            fontWeight: theme.fontWeight.bold,
                          }}
                        >
                          {String(score.correct)} / {String(score.total)} correct
                        </BodyText>
                      </View>
                    </View>
                  </Row>

                  <Stack gap="lg">
                    <Heading level={2}>Topic mastery</Heading>
                    {rows.length === 0 ? (
                      <Card elevated>
                        <BodyText variant="muted">No per-topic data for this session.</BodyText>
                      </Card>
                    ) : (
                      rows.map((row) => (
                        <Card key={row.topicId} padding="lg" radius="lg" elevated>
                          <Stack gap="sm">
                            <Row justify="space-between" align="center">
                              <Heading level={3}>{row.title}</Heading>
                              <BodyText
                                style={{
                                  color:
                                    row.accuracy >= 0.8
                                      ? theme.colors.tertiary
                                      : row.accuracy >= 0.6
                                        ? theme.colors.secondary
                                        : theme.colors.danger,
                                  fontWeight: theme.fontWeight.bold,
                                }}
                              >
                                {formatPercent(row.accuracy)}
                              </BodyText>
                            </Row>
                            <View
                              style={{
                                height: 8,
                                backgroundColor: theme.colors.surfaceHighest,
                                borderRadius: theme.radius.pill,
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                style={{
                                  width:
                                    `${String(Math.round(row.accuracy * 100))}%` as DimensionValue,
                                  height: '100%',
                                  backgroundColor:
                                    row.accuracy >= 0.6
                                      ? theme.colors.secondaryContainer
                                      : theme.colors.danger,
                                }}
                              />
                            </View>
                            <BodyText variant="muted">
                              {String(row.correct)} of {String(row.total)} correct
                            </BodyText>
                          </Stack>
                        </Card>
                      ))
                    )}
                  </Stack>

                  <Row gap="md" wrap>
                    <Link href={`/cert/${state.session.certificationId}`} asChild>
                      <Pressable testID="back-to-cert-home" style={{ flex: 1, minWidth: 220 }}>
                        <Card padding="lg" radius="lg" tone="muted">
                          <BodyText style={{ fontWeight: theme.fontWeight.bold }}>
                            ← Back to cert home
                          </BodyText>
                        </Card>
                      </Pressable>
                    </Link>
                    <Link href={`/cert/${state.session.certificationId}/quiz`} asChild>
                      <Pressable testID="start-another-quiz" style={{ flex: 1, minWidth: 220 }}>
                        <Card padding="lg" radius="lg" tone="muted">
                          <BodyText
                            style={{
                              fontWeight: theme.fontWeight.bold,
                              color: theme.colors.primary,
                            }}
                          >
                            Start another quiz →
                          </BodyText>
                        </Card>
                      </Pressable>
                    </Link>
                  </Row>
                </Stack>
              );
            })()
          : null}
      </View>
    </ScrollView>
  );
}
