import type {
  AttemptResultResponse,
  ChoiceId,
  FeedbackMode,
  PresentedQuestion,
} from '@acpt/shared';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, type ViewStyle } from 'react-native';

import { Badge } from '../../components/Badge';
import { BodyText } from '../../components/BodyText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Row } from '../../components/Row';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';
import type { Tokens } from '../../theme/tokens';

export type QuizRunnerViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      feedbackMode: FeedbackMode;
      currentIndex: number;
      totalQuestions: number;
      question: PresentedQuestion;
      lastResult: AttemptResultResponse | null;
      isSubmittingAttempt: boolean;
      isCompleting: boolean;
      isLastQuestion: boolean;
    };

export interface QuizRunnerViewProps {
  state: QuizRunnerViewState;
  onSubmitAnswer: (selected: readonly ChoiceId[]) => void;
  onNext: () => void;
  onFinish: () => void;
}

function choiceStyle(theme: Tokens, selected: boolean, disabled: boolean): ViewStyle {
  return {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    borderColor: selected ? theme.colors.primary : theme.colors.border,
    backgroundColor: selected ? theme.colors.primaryMuted : theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    opacity: disabled ? 0.8 : 1,
  };
}

function openSourceUrl(url: string): void {
  void Linking.openURL(url);
}

export function QuizRunnerView({
  state,
  onSubmitAnswer,
  onNext,
  onFinish,
}: QuizRunnerViewProps): React.JSX.Element {
  const theme = useTheme();
  const [selected, setSelected] = useState<readonly ChoiceId[]>([]);

  if (state.status === 'loading') {
    return (
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.background,
          flexGrow: 1,
        }}
        testID="quiz-runner-screen"
      >
        <Spinner label="Loading quiz" />
      </ScrollView>
    );
  }

  if (state.status === 'error') {
    return (
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.background,
          flexGrow: 1,
        }}
        testID="quiz-runner-screen"
      >
        <Card>
          <Stack gap="xs">
            <Heading level={3}>Couldn&apos;t load this quiz</Heading>
            <BodyText variant="muted">{state.message}</BodyText>
          </Stack>
        </Card>
      </ScrollView>
    );
  }

  const isRevealed = state.lastResult !== null;
  const toggleChoice = (id: ChoiceId): void => {
    if (isRevealed) return;
    setSelected((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
  };

  const handleSubmit = (): void => {
    if (selected.length === 0) return;
    onSubmitAnswer(selected);
  };

  const handleNext = (): void => {
    setSelected([]);
    onNext();
  };

  const handleFinish = (): void => {
    setSelected([]);
    onFinish();
  };

  const resultCard = ((): React.JSX.Element | null => {
    const result = state.lastResult;
    if (result === null) return null;
    if (!result.revealed) {
      return (
        <Card>
          <Stack gap="xs">
            <Heading level={3}>Answer recorded</Heading>
            <BodyText variant="muted">
              Your score will be revealed when you finish the quiz.
            </BodyText>
          </Stack>
        </Card>
      );
    }
    return (
      <Card>
        <Stack gap="sm">
          <Row gap="sm" align="center">
            <Heading level={3}>{result.isCorrect ? 'Correct' : 'Incorrect'}</Heading>
            <Badge
              label={result.isCorrect ? 'Nice' : 'Review'}
              tone={result.isCorrect ? 'success' : 'danger'}
            />
          </Row>
          <BodyText variant="muted">Correct answer: {result.correctChoiceIds.join(', ')}</BodyText>
          <BodyText>{result.explanation}</BodyText>
          <Pressable
            onPress={() => {
              openSourceUrl(result.sourceUrl);
            }}
            testID="source-link"
          >
            <BodyText variant="small">Source: {result.sourceUrl}</BodyText>
          </Pressable>
        </Stack>
      </Card>
    );
  })();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
      testID="quiz-runner-screen"
    >
      <Stack gap="lg">
        <Row justify="space-between" align="center">
          <BodyText variant="muted">
            Question {String(state.currentIndex + 1)} of {String(state.totalQuestions)}
          </BodyText>
          <Badge label={state.feedbackMode === 'practice' ? 'Practice' : 'Exam'} tone="info" />
        </Row>

        <Card>
          <Stack gap="md">
            <Heading level={2}>{state.question.prompt}</Heading>
            <Stack gap="sm">
              {state.question.choices.map((choice) => {
                const isSelected = selected.includes(choice.id);
                return (
                  <Pressable
                    key={choice.id}
                    onPress={() => {
                      toggleChoice(choice.id);
                    }}
                    style={choiceStyle(theme, isSelected, isRevealed)}
                    testID={`choice-${choice.id}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected, disabled: isRevealed }}
                  >
                    <BodyText>
                      {choice.id}. {choice.text}
                    </BodyText>
                  </Pressable>
                );
              })}
            </Stack>
          </Stack>
        </Card>

        {resultCard}

        {!isRevealed ? (
          <Button
            label={state.isSubmittingAttempt ? 'Submitting…' : 'Submit answer'}
            onPress={handleSubmit}
            disabled={selected.length === 0 || state.isSubmittingAttempt}
            size="lg"
            fullWidth
            testID="submit-answer-button"
          />
        ) : state.isLastQuestion ? (
          <Button
            label={state.isCompleting ? 'Finishing…' : 'Finish quiz'}
            onPress={handleFinish}
            disabled={state.isCompleting}
            size="lg"
            fullWidth
            testID="finish-quiz-button"
          />
        ) : (
          <Button
            label="Next question"
            onPress={handleNext}
            size="lg"
            fullWidth
            testID="next-question-button"
          />
        )}
      </Stack>
    </ScrollView>
  );
}
