import {
  QuizSessionResponseSchema,
  type QuizSessionId,
  type QuizSessionResponse,
} from '@acpt/shared';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { api } from '../client';

export function quizSessionQueryKey(sessionId: QuizSessionId): readonly unknown[] {
  return ['quiz-sessions', sessionId] as const;
}

export function useQuizSession(sessionId: QuizSessionId): UseQueryResult<QuizSessionResponse> {
  return useQuery({
    queryKey: quizSessionQueryKey(sessionId),
    queryFn: async () => {
      const raw = await api.get<unknown>(`/quiz-sessions/${sessionId}`);
      return QuizSessionResponseSchema.parse(raw);
    },
  });
}
