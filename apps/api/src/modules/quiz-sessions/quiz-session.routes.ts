import {
  AttemptResultResponseSchema,
  CreateQuizSessionRequestSchema,
  QuizSessionResponseSchema,
  QuizSessionSummaryResponseSchema,
  SessionIdParamsSchema,
  SubmitAttemptRequestSchema,
} from '@acpt/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import {
  completeQuizSessionHandler,
  createQuizSessionHandler,
  getQuizSessionHandler,
  submitAttemptHandler,
} from './quiz-session.controller.js';

export function registerQuizSessionRoutes(app: FastifyInstance): void {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.post(
    '/quiz-sessions',
    {
      schema: {
        tags: ['quiz-sessions'],
        summary: 'Create a quiz session — server picks N random questions',
        description:
          'Returns the session metadata plus the list of presented questions. The answer key (correctChoiceIds) and the explanation are stripped from the questions in this response — they only appear in the per-attempt response after submission.',
        body: CreateQuizSessionRequestSchema,
        response: {
          200: QuizSessionResponseSchema,
        },
      },
    },
    createQuizSessionHandler,
  );

  typed.get(
    '/quiz-sessions/:sessionId',
    {
      schema: {
        tags: ['quiz-sessions'],
        summary: 'Resume an in-progress (or view a completed) quiz session',
        params: SessionIdParamsSchema,
        response: {
          200: QuizSessionResponseSchema,
        },
      },
    },
    getQuizSessionHandler,
  );

  typed.post(
    '/quiz-sessions/:sessionId/attempts',
    {
      schema: {
        tags: ['quiz-sessions'],
        summary: 'Submit an answer for one question in a session',
        description:
          'Persists the attempt with denormalized topicId, then returns whether it was correct alongside the canonical answer key, explanation, and source link.',
        params: SessionIdParamsSchema,
        body: SubmitAttemptRequestSchema,
        response: {
          200: AttemptResultResponseSchema,
        },
      },
    },
    submitAttemptHandler,
  );

  typed.post(
    '/quiz-sessions/:sessionId/complete',
    {
      schema: {
        tags: ['quiz-sessions'],
        summary: 'Mark a session complete and return the final score',
        description:
          'Aggregates the persisted attempts for this session into total correct/total and a per-topic breakdown. Idempotent: calling again on a completed session returns the same payload.',
        params: SessionIdParamsSchema,
        response: {
          200: QuizSessionSummaryResponseSchema,
        },
      },
    },
    completeQuizSessionHandler,
  );
}
