import {
  type AttemptResultResponse,
  type CreateQuizSessionRequest,
  type PerTopicScore,
  type PresentedQuestion,
  type Question,
  type QuizScore,
  type QuizSession,
  type QuizSessionId,
  type SubmitAttemptRequest,
} from '@acpt/shared';

import { ConflictError } from '../../common/errors/conflict-error.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { ValidationError } from '../../common/errors/validation-error.js';
import { requireCertification } from '../certifications/certification.service.js';
import { findQuestionsByIds } from '../questions/question.repository.js';
import { sampleQuestionsForQuiz } from '../questions/question.service.js';
import { requireQuestion } from '../questions/question.service.js';
import { requireTopic } from '../topics/topic.service.js';

import { createAttempt, findAttemptsBySession } from './attempt.repository.js';
import { createSession, findSessionById, updateSessionStatus } from './quiz-session.repository.js';

function toPresented(question: Question): PresentedQuestion {
  return {
    id: question.id,
    certificationId: question.certificationId,
    topicId: question.topicId,
    prompt: question.prompt,
    choices: question.choices,
    difficulty: question.difficulty,
    tags: question.tags,
  };
}

async function requireSessionForUser(
  userId: string,
  sessionId: QuizSessionId,
): Promise<QuizSession> {
  const session = await findSessionById(sessionId);
  if (session?.userId !== userId) {
    throw new NotFoundError(`Quiz session not found: ${sessionId}`);
  }
  return session;
}

/**
 * Read the questions for a session in the order they were frozen at creation
 * time. Used by both the create-session response and resume.
 */
async function loadSessionQuestions(session: QuizSession): Promise<PresentedQuestion[]> {
  const questions = await findQuestionsByIds(session.questionIds);
  // Preserve the original order — findQuestionsByIds returns in arbitrary order.
  const byId = new Map(questions.map((q) => [q.id, q]));
  return session.questionIds.flatMap((id) => {
    const q = byId.get(id);
    return q ? [toPresented(q)] : [];
  });
}

export async function createQuizSession(
  userId: string,
  request: CreateQuizSessionRequest,
): Promise<{ session: QuizSession; questions: PresentedQuestion[] }> {
  await requireCertification(request.certificationId);
  if (request.topicId !== undefined) {
    await requireTopic(request.topicId);
  }

  const sampled = await sampleQuestionsForQuiz(
    request.certificationId,
    request.length,
    request.topicId,
  );

  if (sampled.length < request.length) {
    throw new ConflictError(
      `Not enough questions available for this quiz: requested ${String(request.length)}, found ${String(sampled.length)}`,
    );
  }

  const session = await createSession({
    userId,
    certificationId: request.certificationId,
    mode: request.mode,
    feedbackMode: request.feedbackMode,
    length: request.length,
    questionIds: sampled.map((q) => q.id),
    ...(request.topicId !== undefined ? { topicId: request.topicId } : {}),
  });

  return {
    session,
    questions: sampled.map(toPresented),
  };
}

export async function resumeQuizSession(
  userId: string,
  sessionId: QuizSessionId,
): Promise<{ session: QuizSession; questions: PresentedQuestion[] }> {
  const session = await requireSessionForUser(userId, sessionId);
  const questions = await loadSessionQuestions(session);
  return { session, questions };
}

export async function submitQuizAttempt(
  userId: string,
  sessionId: QuizSessionId,
  request: SubmitAttemptRequest,
): Promise<AttemptResultResponse> {
  const session = await requireSessionForUser(userId, sessionId);

  if (session.status !== 'in-progress') {
    throw new ConflictError('Cannot submit answers for a session that is not in progress');
  }

  if (!session.questionIds.includes(request.questionId)) {
    throw new ValidationError('That question is not part of this quiz session', {
      sessionId,
      questionId: request.questionId,
    });
  }

  const question = await requireQuestion(request.questionId);

  // Validate the user only selected choices that actually exist on the question.
  const choiceIds = new Set(question.choices.map((c) => c.id));
  for (const id of request.selectedChoiceIds) {
    if (!choiceIds.has(id)) {
      throw new ValidationError(`Choice "${id}" is not a valid choice for this question`, {
        questionId: request.questionId,
        choiceId: id,
      });
    }
  }

  const selected = new Set(request.selectedChoiceIds);
  const correct = new Set(question.correctChoiceIds);
  const isCorrect = selected.size === correct.size && [...selected].every((id) => correct.has(id));

  // Always persist the attempt with the real isCorrect value — the score
  // computation in `complete` reads from this collection regardless of mode.
  await createAttempt({
    userId,
    quizSessionId: sessionId,
    certificationId: question.certificationId,
    topicId: question.topicId,
    questionId: question.id,
    selectedChoiceIds: request.selectedChoiceIds,
    isCorrect,
  });

  // The response shape depends on the session's feedback mode. In `exam` mode
  // we deliberately do NOT leak the answer key so the user has to wait until
  // they complete the session.
  if (session.feedbackMode === 'practice') {
    return {
      questionId: question.id,
      revealed: true,
      isCorrect,
      correctChoiceIds: question.correctChoiceIds,
      explanation: question.explanation,
      sourceUrl: question.sourceUrl,
    };
  }

  return {
    questionId: question.id,
    revealed: false,
  };
}

export async function completeQuizSession(
  userId: string,
  sessionId: QuizSessionId,
): Promise<{ session: QuizSession }> {
  const session = await requireSessionForUser(userId, sessionId);

  // Idempotent: completing an already-completed session returns it as-is.
  if (session.status === 'completed') {
    return { session };
  }

  const attempts = await findAttemptsBySession(userId, sessionId);

  const perTopic: PerTopicScore = {};
  let totalCorrect = 0;
  for (const attempt of attempts) {
    const key = attempt.topicId;
    const bucket = perTopic[key] ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (attempt.isCorrect) {
      bucket.correct += 1;
      totalCorrect += 1;
    }
    perTopic[key] = bucket;
  }

  const score: QuizScore = {
    correct: totalCorrect,
    total: attempts.length,
    perTopic,
  };

  const updated = await updateSessionStatus(sessionId, 'completed', score);
  return { session: updated };
}
