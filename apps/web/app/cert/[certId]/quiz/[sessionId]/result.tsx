import type { CertificationId, QuizSessionId } from '@acpt/shared';
import { useLocalSearchParams } from 'expo-router';

import { useQuizSession } from '../../../../../src/api/hooks/use-quiz-session';
import { useTopics } from '../../../../../src/api/hooks/use-topics';
import {
  QuizResultView,
  type QuizResultViewState,
} from '../../../../../src/features/quiz/QuizResultView';

export default function QuizResultScreen(): React.JSX.Element {
  const { certId, sessionId } = useLocalSearchParams<{
    certId: string;
    sessionId: string;
  }>();
  const brandedCertId = certId as CertificationId;
  const brandedSessionId = sessionId as QuizSessionId;

  const sessionQuery = useQuizSession(brandedSessionId);
  const topicsQuery = useTopics(brandedCertId);

  const state: QuizResultViewState =
    sessionQuery.isPending || topicsQuery.isPending
      ? { status: 'loading' }
      : sessionQuery.isError
        ? { status: 'error', message: sessionQuery.error.message }
        : topicsQuery.isError
          ? { status: 'error', message: topicsQuery.error.message }
          : {
              status: 'success',
              session: sessionQuery.data.session,
              topics: topicsQuery.data.items,
            };

  return <QuizResultView state={state} />;
}
