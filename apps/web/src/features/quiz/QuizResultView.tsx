import type { PerTopicScore, QuizSession, Topic } from '@acpt/shared';
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
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
      testID="quiz-result-screen"
    >
      {state.status === 'loading' ? <Spinner label="Finishing quiz" /> : null}

      {state.status === 'error' ? (
        <Card>
          <Stack gap="xs">
            <Heading level={3}>Couldn&apos;t finish the quiz</Heading>
            <BodyText variant="muted">{state.message}</BodyText>
          </Stack>
        </Card>
      ) : null}

      {state.status === 'success' && state.session.score !== undefined ? (
        <Stack gap="xl">
          <Stack gap="xs">
            <Heading level={1}>Quiz complete</Heading>
            <BodyText variant="muted">
              {state.session.feedbackMode === 'practice' ? 'Practice' : 'Exam'} mode,{' '}
              {String(state.session.length)} questions.
            </BodyText>
          </Stack>

          <Card>
            <Stack gap="sm">
              <Heading level={2}>
                {String(state.session.score.correct)} / {String(state.session.score.total)}
              </Heading>
              <Row gap="sm" align="center">
                <Badge
                  label={formatPercent(
                    state.session.score.total === 0
                      ? 0
                      : state.session.score.correct / state.session.score.total,
                  )}
                  tone="info"
                />
                <BodyText variant="muted">Overall accuracy</BodyText>
              </Row>
            </Stack>
          </Card>

          <Stack gap="md">
            <Heading level={2}>Per topic</Heading>
            {buildPerTopicRows(state.session.score.perTopic, state.topics).map((row) => (
              <Card key={row.topicId} padding="md">
                <Stack gap="xs">
                  <Row justify="space-between" align="center">
                    <Heading level={3}>{row.title}</Heading>
                    <Badge label={formatPercent(row.accuracy)} tone="neutral" />
                  </Row>
                  <BodyText variant="muted">
                    {String(row.correct)} of {String(row.total)} correct
                  </BodyText>
                </Stack>
              </Card>
            ))}
          </Stack>

          <Row gap="md" wrap>
            <Link href={`/cert/${state.session.certificationId}`} asChild>
              <Pressable testID="back-to-cert-home">
                <Card padding="md">
                  <BodyText>Back to cert home</BodyText>
                </Card>
              </Pressable>
            </Link>
            <Link href={`/cert/${state.session.certificationId}/quiz`} asChild>
              <Pressable testID="start-another-quiz">
                <Card padding="md">
                  <BodyText>Start another quiz</BodyText>
                </Card>
              </Pressable>
            </Link>
          </Row>
        </Stack>
      ) : null}
    </ScrollView>
  );
}
