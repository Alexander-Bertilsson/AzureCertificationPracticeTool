import type { CertificationId, Question, QuestionId, TopicId } from '@acpt/shared';

import { NotFoundError } from '../../common/errors/not-found-error.js';
import { requireCertification } from '../certifications/certification.service.js';
import { requireTopic } from '../topics/topic.service.js';

import {
  findQuestionById,
  findQuestionsByCertification,
  sampleQuestions as repoSampleQuestions,
} from './question.repository.js';

/**
 * List all questions for a certification, optionally filtered by topic.
 * Used by the test/admin endpoint, not by the quiz UI.
 */
export async function listQuestionsForCertification(
  certId: CertificationId,
  topicId?: TopicId,
): Promise<Question[]> {
  await requireCertification(certId);
  if (topicId !== undefined) {
    await requireTopic(topicId);
  }
  return findQuestionsByCertification(certId, topicId);
}

/**
 * Sample N random questions from a certification, optionally restricted to a
 * single topic. Caller is responsible for choosing N. Used by the
 * quiz-sessions module when building a session.
 */
export async function sampleQuestionsForQuiz(
  certId: CertificationId,
  count: number,
  topicId?: TopicId,
): Promise<Question[]> {
  await requireCertification(certId);
  if (topicId !== undefined) {
    await requireTopic(topicId);
  }
  return repoSampleQuestions(certId, count, topicId);
}

export async function requireQuestion(id: QuestionId): Promise<Question> {
  const question = await findQuestionById(id);
  if (question === null) {
    throw new NotFoundError(`Question not found: ${id}`);
  }
  return question;
}
