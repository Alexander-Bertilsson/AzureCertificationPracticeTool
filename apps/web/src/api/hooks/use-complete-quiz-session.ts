import {
  QuizSessionSummaryResponseSchema,
  type QuizSessionId,
  type QuizSessionSummaryResponse,
} from '@acpt/shared';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { api } from '../client';

export function useCompleteQuizSession(
  sessionId: QuizSessionId,
): UseMutationResult<QuizSessionSummaryResponse, Error, void> {
  return useMutation({
    mutationFn: async () => {
      const raw = await api.post<unknown>(`/quiz-sessions/${sessionId}/complete`);
      return QuizSessionSummaryResponseSchema.parse(raw);
    },
  });
}
