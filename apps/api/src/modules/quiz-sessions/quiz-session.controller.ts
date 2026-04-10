import {
  HARDCODED_USER_ID,
  type AttemptResultResponse,
  type CreateQuizSessionRequest,
  type QuizSessionResponse,
  type QuizSessionSummaryResponse,
  type SessionIdParams,
  type SubmitAttemptRequest,
} from '@acpt/shared';
import type { FastifyRequest } from 'fastify';

import {
  completeQuizSession,
  createQuizSession,
  resumeQuizSession,
  submitQuizAttempt,
} from './quiz-session.service.js';

export async function createQuizSessionHandler(
  req: FastifyRequest<{ Body: CreateQuizSessionRequest }>,
): Promise<QuizSessionResponse> {
  return createQuizSession(HARDCODED_USER_ID, req.body);
}

export async function getQuizSessionHandler(
  req: FastifyRequest<{ Params: SessionIdParams }>,
): Promise<QuizSessionResponse> {
  return resumeQuizSession(HARDCODED_USER_ID, req.params.sessionId);
}

export async function submitAttemptHandler(
  req: FastifyRequest<{ Params: SessionIdParams; Body: SubmitAttemptRequest }>,
): Promise<AttemptResultResponse> {
  return submitQuizAttempt(HARDCODED_USER_ID, req.params.sessionId, req.body);
}

export async function completeQuizSessionHandler(
  req: FastifyRequest<{ Params: SessionIdParams }>,
): Promise<QuizSessionSummaryResponse> {
  return completeQuizSession(HARDCODED_USER_ID, req.params.sessionId);
}
