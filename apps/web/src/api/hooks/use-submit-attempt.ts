import {
  AttemptResultResponseSchema,
  type AttemptResultResponse,
  type QuizSessionId,
  type SubmitAttemptRequest,
} from '@acpt/shared';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { api } from '../client';

export function useSubmitAttempt(
  sessionId: QuizSessionId,
): UseMutationResult<AttemptResultResponse, Error, SubmitAttemptRequest> {
  return useMutation({
    mutationFn: async (body: SubmitAttemptRequest) => {
      const raw = await api.post<unknown>(`/quiz-sessions/${sessionId}/attempts`, body);
      return AttemptResultResponseSchema.parse(raw);
    },
  });
}
