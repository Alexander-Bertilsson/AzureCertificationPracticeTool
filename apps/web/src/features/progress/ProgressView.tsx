import type { ProgressResponse } from '@acpt/shared';
import { ScrollView } from 'react-native';

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
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
      testID="progress-screen"
    >
      <Stack gap="xl">
        <Stack gap="xs">
          <Heading level={1}>Progress</Heading>
          <BodyText variant="muted">
            Overall accuracy, weakest topics, and your recent quizzes.
          </BodyText>
        </Stack>

        {state.status === 'loading' ? <Spinner label="Loading progress" /> : null}

        {state.status === 'error' ? (
          <Card>
            <Stack gap="xs">
              <Heading level={3}>Couldn&apos;t load progress</Heading>
              <BodyText variant="muted">{state.message}</BodyText>
            </Stack>
          </Card>
        ) : null}

        {state.status === 'success' ? (
          <>
            <Card>
              <Stack gap="sm">
                <Heading level={2}>
                  {String(state.progress.totalCorrect)} / {String(state.progress.totalAttempts)}
                </Heading>
                <Row gap="sm" align="center">
                  <Badge label={formatPercent(state.progress.overallAccuracy)} tone="info" />
                  <BodyText variant="muted">Overall accuracy across all attempts</BodyText>
                </Row>
              </Stack>
            </Card>

            <Stack gap="md">
              <Heading level={2}>Weakest topics</Heading>
              {state.progress.perTopic.length === 0 ? (
                <Card>
                  <BodyText variant="muted">
                    No attempts yet. Take a quiz to populate this section.
                  </BodyText>
                </Card>
              ) : (
                state.progress.perTopic.map((topic) => (
                  <Card key={topic.topicId} padding="md" testID={`topic-${topic.topicSlug}`}>
                    <Stack gap="xs">
                      <Row justify="space-between" align="center">
                        <Heading level={3}>{topic.topicTitle}</Heading>
                        <Badge label={formatPercent(topic.accuracy)} tone="neutral" />
                      </Row>
                      <BodyText variant="muted">
                        {String(topic.correct)} of {String(topic.total)} correct
                      </BodyText>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>

            <Stack gap="md">
              <Heading level={2}>Recent sessions</Heading>
              {state.progress.recentSessions.length === 0 ? (
                <Card>
                  <BodyText variant="muted">No sessions yet.</BodyText>
                </Card>
              ) : (
                state.progress.recentSessions.map((session) => (
                  <Card
                    key={session.sessionId}
                    padding="md"
                    testID={`session-${session.sessionId}`}
                  >
                    <Stack gap="xs">
                      <Row justify="space-between" align="center">
                        <BodyText>{formatDate(session.startedAt)}</BodyText>
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
    </ScrollView>
  );
}
