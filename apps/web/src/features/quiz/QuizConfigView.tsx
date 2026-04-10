import type {
  CertificationId,
  CreateQuizSessionRequest,
  FeedbackMode,
  QuizLength,
  QuizMode,
  Topic,
  TopicId,
} from '@acpt/shared';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';

import { BodyText } from '../../components/BodyText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Row } from '../../components/Row';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';
import type { Tokens } from '../../theme/tokens';

export interface QuizConfigViewProps {
  certificationId: CertificationId;
  topics: readonly Topic[];
  isTopicsLoading: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  onStart: (config: CreateQuizSessionRequest) => void;
}

interface OptionButtonProps<T extends string | number> {
  label: string;
  value: T;
  selected: boolean;
  onSelect: (value: T) => void;
  testID?: string;
}

function optionStyle(theme: Tokens, selected: boolean): ViewStyle {
  return {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    borderColor: selected ? theme.colors.primary : theme.colors.border,
    backgroundColor: selected ? theme.colors.primaryMuted : theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  };
}

function OptionButton<T extends string | number>({
  label,
  value,
  selected,
  onSelect,
  testID,
}: OptionButtonProps<T>): React.JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        onSelect(value);
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={optionStyle(theme, selected)}
      testID={testID}
    >
      <BodyText>{label}</BodyText>
    </Pressable>
  );
}

export function QuizConfigView({
  certificationId,
  topics,
  isTopicsLoading,
  isSubmitting,
  errorMessage,
  onStart,
}: QuizConfigViewProps): React.JSX.Element {
  const theme = useTheme();

  const [length, setLength] = useState<QuizLength>(25);
  const [mode, setMode] = useState<QuizMode>('mixed');
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('practice');
  const [topicId, setTopicId] = useState<TopicId | null>(null);

  const sortedTopics = useMemo(() => [...topics].sort((a, b) => a.order - b.order), [topics]);

  const canStart =
    !isSubmitting && (mode === 'mixed' || (mode === 'single-topic' && topicId !== null));

  const handleStart = (): void => {
    const base = {
      certificationId,
      length,
      feedbackMode,
    };
    if (mode === 'single-topic' && topicId !== null) {
      onStart({ ...base, mode, topicId });
      return;
    }
    if (mode === 'mixed') {
      onStart({ ...base, mode });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
      testID="quiz-config-screen"
    >
      <Stack gap="xl">
        <Stack gap="xs">
          <Heading level={1}>Start a quiz</Heading>
          <BodyText variant="muted">Pick a length, mode, and feedback style.</BodyText>
        </Stack>

        <Stack gap="md">
          <Heading level={2}>Length</Heading>
          <Row gap="sm" wrap>
            <OptionButton<QuizLength>
              label="25 questions"
              value={25}
              selected={length === 25}
              onSelect={setLength}
              testID="length-25"
            />
            <OptionButton<QuizLength>
              label="50 questions"
              value={50}
              selected={length === 50}
              onSelect={setLength}
              testID="length-50"
            />
          </Row>
        </Stack>

        <Stack gap="md">
          <Heading level={2}>Mode</Heading>
          <Row gap="sm" wrap>
            <OptionButton<QuizMode>
              label="Mixed from all topics"
              value="mixed"
              selected={mode === 'mixed'}
              onSelect={(next) => {
                setMode(next);
                setTopicId(null);
              }}
              testID="mode-mixed"
            />
            <OptionButton<QuizMode>
              label="Single topic"
              value="single-topic"
              selected={mode === 'single-topic'}
              onSelect={setMode}
              testID="mode-single-topic"
            />
          </Row>
        </Stack>

        {mode === 'single-topic' ? (
          <Stack gap="md">
            <Heading level={2}>Topic</Heading>
            {isTopicsLoading ? (
              <Spinner label="Loading topics" />
            ) : (
              <Stack gap="sm">
                {sortedTopics.map((topic) => (
                  <OptionButton<TopicId>
                    key={topic.id}
                    label={topic.title}
                    value={topic.id}
                    selected={topicId === topic.id}
                    onSelect={setTopicId}
                    testID={`topic-${topic.slug}`}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        ) : null}

        <Stack gap="md">
          <Heading level={2}>Feedback mode</Heading>
          <Row gap="sm" wrap>
            <OptionButton<FeedbackMode>
              label="Practice — reveal answers"
              value="practice"
              selected={feedbackMode === 'practice'}
              onSelect={setFeedbackMode}
              testID="feedback-practice"
            />
            <OptionButton<FeedbackMode>
              label="Exam — reveal at the end"
              value="exam"
              selected={feedbackMode === 'exam'}
              onSelect={setFeedbackMode}
              testID="feedback-exam"
            />
          </Row>
        </Stack>

        {errorMessage !== undefined && errorMessage.length > 0 ? (
          <Card>
            <BodyText variant="muted">{errorMessage}</BodyText>
          </Card>
        ) : null}

        <View>
          <Button
            label={isSubmitting ? 'Starting…' : 'Start quiz'}
            onPress={handleStart}
            disabled={!canStart}
            size="lg"
            fullWidth
            testID="start-quiz-button"
          />
        </View>
      </Stack>
    </ScrollView>
  );
}
