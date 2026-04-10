import type {
  AttemptResultResponse,
  CertificationId,
  PresentedQuestion,
  QuestionId,
  TopicId,
} from '@acpt/shared';
import { fireEvent, render } from '@testing-library/react-native';

import { QuizRunnerView, type QuizRunnerViewState } from '../QuizRunnerView';

const QUESTION_ID = '507f1f77bcf86cd799439041' as QuestionId;

function makeQuestion(overrides: Partial<PresentedQuestion> = {}): PresentedQuestion {
  return {
    id: QUESTION_ID,
    certificationId: '507f1f77bcf86cd799439011' as CertificationId,
    topicId: '507f1f77bcf86cd799439021' as TopicId,
    prompt: 'Which service provides identity management?',
    choices: [
      { id: 'A', text: 'Azure Storage' },
      { id: 'B', text: 'Entra ID' },
      { id: 'C', text: 'Azure Monitor' },
      { id: 'D', text: 'Azure Functions' },
    ],
    questionType: 'single',
    difficulty: 'easy',
    tags: ['identity'],
    ...overrides,
  };
}

function makeReadyState(
  overrides: Partial<Extract<QuizRunnerViewState, { status: 'ready' }>> = {},
): QuizRunnerViewState {
  return {
    status: 'ready',
    feedbackMode: 'practice',
    currentIndex: 0,
    totalQuestions: 5,
    question: makeQuestion(),
    lastResult: null,
    isSubmittingAttempt: false,
    isCompleting: false,
    isLastQuestion: false,
    ...overrides,
  };
}

describe('QuizRunnerView', () => {
  it('submits the selected choice for a single-answer question', () => {
    const onSubmitAnswer = jest.fn();

    const { getByTestId } = render(
      <QuizRunnerView
        state={makeReadyState()}
        onSubmitAnswer={onSubmitAnswer}
        onNext={jest.fn()}
        onFinish={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('choice-B'));
    fireEvent.press(getByTestId('submit-answer-button'));

    expect(onSubmitAnswer).toHaveBeenCalledWith(['B']);
  });

  it('treats a single-answer question as a radio group', () => {
    const onSubmitAnswer = jest.fn();

    const { getByTestId } = render(
      <QuizRunnerView
        state={makeReadyState()}
        onSubmitAnswer={onSubmitAnswer}
        onNext={jest.fn()}
        onFinish={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('choice-A'));
    fireEvent.press(getByTestId('choice-C'));
    fireEvent.press(getByTestId('submit-answer-button'));

    expect(onSubmitAnswer).toHaveBeenCalledTimes(1);
    expect(onSubmitAnswer).toHaveBeenCalledWith(['C']);
  });

  it('allows multiple choices on a multiple-answer question', () => {
    const onSubmitAnswer = jest.fn();

    const { getByTestId, getByText } = render(
      <QuizRunnerView
        state={makeReadyState({
          question: makeQuestion({ questionType: 'multiple' }),
        })}
        onSubmitAnswer={onSubmitAnswer}
        onNext={jest.fn()}
        onFinish={jest.fn()}
      />,
    );

    expect(getByText('Select all that apply.')).toBeTruthy();

    fireEvent.press(getByTestId('choice-A'));
    fireEvent.press(getByTestId('choice-C'));
    fireEvent.press(getByTestId('submit-answer-button'));

    expect(onSubmitAnswer).toHaveBeenCalledWith(['A', 'C']);
  });

  it('shows the next button after a practice-mode result is revealed', () => {
    const revealed: AttemptResultResponse = {
      questionId: QUESTION_ID,
      revealed: true,
      isCorrect: true,
      correctChoiceIds: ['B'],
      explanation: 'Entra ID is the identity service.',
      sourceUrl: 'https://learn.microsoft.com/entra',
    };

    const { getByTestId, getByText } = render(
      <QuizRunnerView
        state={makeReadyState({ lastResult: revealed })}
        onSubmitAnswer={jest.fn()}
        onNext={jest.fn()}
        onFinish={jest.fn()}
      />,
    );

    expect(getByText('Correct')).toBeTruthy();
    expect(getByText('Entra ID is the identity service.')).toBeTruthy();
    expect(getByTestId('next-question-button')).toBeTruthy();
  });

  it('shows the finish button on the last question after submission', () => {
    const onFinish = jest.fn();
    const revealed: AttemptResultResponse = {
      questionId: QUESTION_ID,
      revealed: false,
    };

    const { getByTestId } = render(
      <QuizRunnerView
        state={makeReadyState({ isLastQuestion: true, lastResult: revealed })}
        onSubmitAnswer={jest.fn()}
        onNext={jest.fn()}
        onFinish={onFinish}
      />,
    );

    fireEvent.press(getByTestId('finish-quiz-button'));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('hides correctness when running in exam mode', () => {
    const result: AttemptResultResponse = {
      questionId: QUESTION_ID,
      revealed: false,
    };

    const { getByText, queryByText } = render(
      <QuizRunnerView
        state={makeReadyState({ feedbackMode: 'exam', lastResult: result })}
        onSubmitAnswer={jest.fn()}
        onNext={jest.fn()}
        onFinish={jest.fn()}
      />,
    );

    expect(getByText('Answer recorded')).toBeTruthy();
    expect(queryByText('Correct')).toBeNull();
    expect(queryByText('Incorrect')).toBeNull();
  });
});
