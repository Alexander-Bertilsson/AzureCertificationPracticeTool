import {
  QuizSessionResponseSchema,
  type CreateQuizSessionRequest,
  type QuizSessionResponse,
} from '@acpt/shared';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { api } from '../client';

export function useCreateQuizSession(): UseMutationResult<
  QuizSessionResponse,
  Error,
  CreateQuizSessionRequest
> {
  return useMutation({
    mutationFn: async (body: CreateQuizSessionRequest) => {
      const raw = await api.post<unknown>('/quiz-sessions', body);
      return QuizSessionResponseSchema.parse(raw);
    },
  });
}
