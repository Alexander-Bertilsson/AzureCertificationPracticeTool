import type { AttemptResultResponse, CertificationId, ChoiceId, QuizSessionId } from '@acpt/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useCompleteQuizSession } from '../../../../../src/api/hooks/use-complete-quiz-session';
import { useQuizSession } from '../../../../../src/api/hooks/use-quiz-session';
import { useSubmitAttempt } from '../../../../../src/api/hooks/use-submit-attempt';
import {
  QuizRunnerView,
  type QuizRunnerViewState,
} from '../../../../../src/features/quiz/QuizRunnerView';

export default function QuizRunnerScreen(): React.JSX.Element {
  const { certId, sessionId } = useLocalSearchParams<{
    certId: string;
    sessionId: string;
  }>();
  const brandedCertId = certId as CertificationId;
  const brandedSessionId = sessionId as QuizSessionId;

  const sessionQuery = useQuizSession(brandedSessionId);
  const submitMutation = useSubmitAttempt(brandedSessionId);
  const completeMutation = useCompleteQuizSession(brandedSessionId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastResult, setLastResult] = useState<AttemptResultResponse | null>(null);

  const buildState = (): QuizRunnerViewState => {
    if (sessionQuery.isPending) return { status: 'loading' };
    if (sessionQuery.isError) return { status: 'error', message: sessionQuery.error.message };

    const { session, questions } = sessionQuery.data;
    const question = questions[currentIndex];
    if (question === undefined) {
      return { status: 'error', message: 'Question not found in session' };
    }

    return {
      status: 'ready',
      feedbackMode: session.feedbackMode,
      currentIndex,
      totalQuestions: questions.length,
      question,
      lastResult,
      isSubmittingAttempt: submitMutation.isPending,
      isCompleting: completeMutation.isPending,
      isLastQuestion: currentIndex === questions.length - 1,
    };
  };

  const handleSubmitAnswer = (selected: readonly ChoiceId[]): void => {
    if (!sessionQuery.isSuccess) return;
    const question = sessionQuery.data.questions[currentIndex];
    if (question === undefined) return;
    submitMutation.mutate(
      { questionId: question.id, selectedChoiceIds: [...selected] },
      {
        onSuccess: (result) => {
          setLastResult(result);
        },
      },
    );
  };

  const handleNext = (): void => {
    setLastResult(null);
    setCurrentIndex((i) => i + 1);
  };

  const handleFinish = (): void => {
    completeMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace(`/cert/${brandedCertId}/quiz/${brandedSessionId}/result`);
      },
    });
  };

  return (
    <QuizRunnerView
      state={buildState()}
      onSubmitAnswer={handleSubmitAnswer}
      onNext={handleNext}
      onFinish={handleFinish}
    />
  );
}
