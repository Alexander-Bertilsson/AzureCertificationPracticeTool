import type {
  AttemptResultResponse,
  ChoiceId,
  FeedbackMode,
  PresentedQuestion,
} from '@acpt/shared';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  View,
  type DimensionValue,
  type ViewStyle,
} from 'react-native';

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
    borderRadius: theme.radius.lg,
    backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 56,
    justifyContent: 'center',
    opacity: disabled && !selected ? 0.7 : 1,
    ...(selected ? theme.shadow.ambient : {}),
  };
}

function openSourceUrl(url: string): void {
  void Linking.openURL(url);
}

function screenContainerStyle(theme: Tokens): ViewStyle {
  return {
    backgroundColor: theme.colors.background,
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
  };
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
      <ScrollView contentContainerStyle={screenContainerStyle(theme)} testID="quiz-runner-screen">
        <Spinner label="Loading quiz" />
      </ScrollView>
    );
  }

  if (state.status === 'error') {
    return (
      <ScrollView contentContainerStyle={screenContainerStyle(theme)} testID="quiz-runner-screen">
        <Card elevated>
          <Stack gap="xs">
            <Heading level={3}>Couldn&apos;t load this quiz</Heading>
            <BodyText variant="muted">{state.message}</BodyText>
          </Stack>
        </Card>
      </ScrollView>
    );
  }

  const isRevealed = state.lastResult !== null;
  const isSingleSelect = state.question.questionType === 'single';
  const pickChoice = (id: ChoiceId): void => {
    if (isRevealed) return;
    setSelected((current) => {
      if (isSingleSelect) {
        return current.includes(id) ? [] : [id];
      }
      return current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    });
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

  const completionPercent = Math.round(
    ((state.currentIndex + (isRevealed ? 1 : 0)) / state.totalQuestions) * 100,
  );

  const resultCard = ((): React.JSX.Element | null => {
    const result = state.lastResult;
    if (result === null) return null;

    if (!result.revealed) {
      return (
        <Card tone="muted" padding="xl" radius="xl">
          <Stack gap="xs">
            <Heading level={3}>Answer recorded</Heading>
            <BodyText variant="muted">
              Your score will be revealed when you finish the quiz.
            </BodyText>
          </Stack>
        </Card>
      );
    }

    const accentColor = result.isCorrect ? theme.colors.tertiary : theme.colors.danger;
    const accentBg = result.isCorrect ? theme.colors.tertiaryFixed : theme.colors.errorContainer;

    return (
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.xl,
          ...theme.shadow.ambient,
        }}
      >
        <Stack gap="md">
          <Row gap="sm" align="center">
            <View
              style={{
                backgroundColor: accentBg,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.radius.pill,
              }}
            >
              <BodyText
                variant="small"
                style={{
                  color: accentColor,
                  fontWeight: theme.fontWeight.bold,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                }}
              >
                {result.isCorrect ? 'Correct' : 'Incorrect'}
              </BodyText>
            </View>
            <BodyText variant="muted">
              Correct answer: {result.correctChoiceIds.join(', ')}
            </BodyText>
          </Row>
          <BodyText>{result.explanation}</BodyText>
          <Pressable
            onPress={() => {
              openSourceUrl(result.sourceUrl);
            }}
            testID="source-link"
          >
            <BodyText
              variant="small"
              style={{
                color: theme.colors.primary,
                fontWeight: theme.fontWeight.bold,
              }}
            >
              Read source →
            </BodyText>
          </Pressable>
        </Stack>
      </View>
    );
  })();

  return (
    <ScrollView contentContainerStyle={screenContainerStyle(theme)} testID="quiz-runner-screen">
      <View style={{ maxWidth: 860, width: '100%', alignSelf: 'center' }}>
        <Stack gap="xl">
          <Stack gap="md">
            <Row justify="space-between" align="flex-end">
              <Stack gap="xs">
                <BodyText
                  variant="small"
                  style={{
                    color: theme.colors.secondary,
                    fontWeight: theme.fontWeight.bold,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                  }}
                >
                  {state.feedbackMode === 'practice' ? 'Practice Mode' : 'Exam Mode'}
                </BodyText>
                <Heading level={1}>
                  Question {String(state.currentIndex + 1)} of {String(state.totalQuestions)}
                </Heading>
              </Stack>
              <BodyText variant="muted">Completion: {String(completionPercent)}%</BodyText>
            </Row>
            <View
              style={{
                height: 12,
                backgroundColor: theme.colors.surfaceHighest,
                borderRadius: theme.radius.pill,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${String(completionPercent)}%` as DimensionValue,
                  height: '100%',
                  backgroundColor: theme.colors.secondaryContainer,
                }}
              />
            </View>
          </Stack>

          <Card padding="xl" radius="xl" elevated>
            <Stack gap="lg">
              <Heading level={2}>{state.question.prompt}</Heading>
              <BodyText variant="muted">
                {isSingleSelect ? 'Pick one answer.' : 'Select all that apply.'}
              </BodyText>
              <Stack gap="sm">
                {state.question.choices.map((choice) => {
                  const isSelected = selected.includes(choice.id);
                  return (
                    <Pressable
                      key={choice.id}
                      onPress={() => {
                        pickChoice(choice.id);
                      }}
                      style={choiceStyle(theme, isSelected, isRevealed)}
                      testID={`choice-${choice.id}`}
                      accessibilityRole={isSingleSelect ? 'radio' : 'checkbox'}
                      accessibilityState={
                        isSingleSelect
                          ? { selected: isSelected, disabled: isRevealed }
                          : { checked: isSelected, disabled: isRevealed }
                      }
                    >
                      <BodyText
                        style={{
                          color: isSelected ? theme.colors.textInverse : theme.colors.text,
                          fontWeight: isSelected ? theme.fontWeight.bold : theme.fontWeight.medium,
                        }}
                      >
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
      </View>
    </ScrollView>
  );
}
