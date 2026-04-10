import type { ProgressResponse } from '@acpt/shared';
import { ScrollView, View, type DimensionValue } from 'react-native';

import { Badge } from '../../components/Badge';
import { BodyText } from '../../components/BodyText';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Row } from '../../components/Row';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';

export type ProgressViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; progress: ProgressResponse };

export interface ProgressViewProps {
  state: ProgressViewState;
}

function formatPercent(ratio: number): string {
  return `${String(Math.round(ratio * 100))}%`;
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function ProgressView({ state }: ProgressViewProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: theme.colors.background,
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingVertical: theme.spacing.xxxl,
      }}
      testID="progress-screen"
    >
      <View style={{ maxWidth: 1100, width: '100%', alignSelf: 'center' }}>
        <Stack gap="xxl">
          <Stack gap="sm">
            <Badge label="Progress Dashboard" tone="info" />
            <Heading level={1}>Your study progress</Heading>
            <BodyText variant="muted">
              Overall accuracy, weakest topics, and your recent quiz sessions.
            </BodyText>
          </Stack>

          {state.status === 'loading' ? <Spinner label="Loading progress" /> : null}

          {state.status === 'error' ? (
            <Card elevated>
              <Stack gap="xs">
                <Heading level={3}>Couldn&apos;t load progress</Heading>
                <BodyText variant="muted">{state.message}</BodyText>
              </Stack>
            </Card>
          ) : null}

          {state.status === 'success' ? (
            <>
              <Row gap="lg" wrap align="stretch">
                <View style={{ flex: 2, minWidth: 320 }}>
                  <Card padding="xl" radius="xxl" elevated>
                    <Stack gap="md">
                      <Badge label="All-time stats" tone="success" />
                      <Heading level={1}>
                        {String(state.progress.totalCorrect)} /{' '}
                        {String(state.progress.totalAttempts)}
                      </Heading>
                      <BodyText variant="muted">
                        correct across every quiz you&apos;ve taken on this certification.
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
                      Overall accuracy
                    </BodyText>
                    <Heading
                      level={1}
                      style={{
                        color: theme.colors.textInverse,
                        fontSize: theme.fontSize.display,
                      }}
                    >
                      {formatPercent(state.progress.overallAccuracy)}
                    </Heading>
                  </View>
                </View>
              </Row>

              <Stack gap="lg">
                <Heading level={2}>Topic mastery</Heading>
                {state.progress.perTopic.length === 0 ? (
                  <Card elevated>
                    <BodyText variant="muted">
                      No attempts yet. Take a quiz to populate this section.
                    </BodyText>
                  </Card>
                ) : (
                  state.progress.perTopic.map((topic) => {
                    const accentColor =
                      topic.accuracy >= 0.8
                        ? theme.colors.tertiary
                        : topic.accuracy >= 0.6
                          ? theme.colors.secondary
                          : theme.colors.danger;
                    const barColor =
                      topic.accuracy >= 0.6 ? theme.colors.secondaryContainer : theme.colors.danger;
                    return (
                      <Card
                        key={topic.topicId}
                        padding="lg"
                        radius="lg"
                        elevated
                        testID={`topic-${topic.topicSlug}`}
                      >
                        <Stack gap="sm">
                          <Row justify="space-between" align="center">
                            <Heading level={3}>{topic.topicTitle}</Heading>
                            <BodyText
                              style={{
                                color: accentColor,
                                fontWeight: theme.fontWeight.bold,
                              }}
                            >
                              {formatPercent(topic.accuracy)}
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
                                  `${String(Math.round(topic.accuracy * 100))}%` as DimensionValue,
                                height: '100%',
                                backgroundColor: barColor,
                              }}
                            />
                          </View>
                          <BodyText variant="muted">
                            {String(topic.correct)} of {String(topic.total)} correct
                          </BodyText>
                        </Stack>
                      </Card>
                    );
                  })
                )}
              </Stack>

              <Stack gap="lg">
                <Heading level={2}>Recent sessions</Heading>
                {state.progress.recentSessions.length === 0 ? (
                  <Card elevated>
                    <BodyText variant="muted">No sessions yet.</BodyText>
                  </Card>
                ) : (
                  state.progress.recentSessions.map((session) => (
                    <Card
                      key={session.sessionId}
                      padding="lg"
                      radius="lg"
                      elevated
                      testID={`session-${session.sessionId}`}
                    >
                      <Stack gap="xs">
                        <Row justify="space-between" align="center">
                          <BodyText
                            style={{
                              fontWeight: theme.fontWeight.bold,
                            }}
                          >
                            {formatDate(session.startedAt)}
                          </BodyText>
                          <Badge
                            label={
                              session.status === 'completed'
                                ? 'Completed'
                                : session.status === 'in-progress'
                                  ? 'In progress'
                                  : 'Abandoned'
                            }
                            tone={session.status === 'completed' ? 'success' : 'neutral'}
                          />
                        </Row>
                        <BodyText variant="muted">
                          {String(session.length)} questions
                          {session.score !== undefined
                            ? ` · ${String(session.score.correct)}/${String(session.score.total)} (${formatPercent(
                                session.score.total === 0
                                  ? 0
                                  : session.score.correct / session.score.total,
                              )})`
                            : ''}
                        </BodyText>
                      </Stack>
                    </Card>
                  ))
                )}
              </Stack>
            </>
          ) : null}
        </Stack>
      </View>
    </ScrollView>
  );
}
