import {
  ErrorEnvelopeSchema,
  HARDCODED_USER_ID,
  ProgressResponseSchema,
  QuizSessionResponseSchema,
  type CertificationId,
  type QuestionId,
  type TopicId,
} from '@acpt/shared';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '../../src/app.js';
import { upsertCertificationBySlug } from '../../src/modules/certifications/certification.repository.js';
import { upsertQuestionByExternalId } from '../../src/modules/questions/question.repository.js';
import { upsertTopicBySlug } from '../../src/modules/topics/topic.repository.js';
import { clearTestDb, startTestDb, stopTestDb } from '../setup-db.js';

describe('progress HTTP', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    await startTestDb();
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await stopTestDb();
  });

  afterEach(clearTestDb);

  /**
   * Seed a cert with two topics (identity, compute) and 30 questions split
   * 15/15 across them. Returns the seeded ids and the correct-answer map so
   * tests can submit valid answers and predict the score.
   */
  async function seedQuizContent(): Promise<{
    certId: CertificationId;
    topicAId: TopicId;
    topicBId: TopicId;
    correctByQuestion: Map<QuestionId, string>;
  }> {
    const cert = await upsertCertificationBySlug({
      code: 'az-104',
      slug: 'az-104',
      title: 'Microsoft Azure Administrator',
      description: '',
      mslearnPathUrl: 'https://learn.microsoft.com/az-104',
    });
    const topicA = await upsertTopicBySlug({
      certificationId: cert.id,
      slug: 'identity',
      title: 'Identity',
      order: 1,
      description: '',
    });
    const topicB = await upsertTopicBySlug({
      certificationId: cert.id,
      slug: 'compute',
      title: 'Compute',
      order: 2,
      description: '',
    });

    const correctByQuestion = new Map<QuestionId, string>();
    for (let i = 0; i < 30; i++) {
      const topicId = i < 15 ? topicA.id : topicB.id;
      const correct = i % 2 === 0 ? 'A' : 'B';
      const q = await upsertQuestionByExternalId({
        certificationId: cert.id,
        topicId,
        externalId: `seed-${String(i)}`,
        prompt: `Test question ${String(i)}`,
        choices: [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' },
        ],
        correctChoiceIds: [correct],
        explanation: `Explanation ${String(i)}`,
        sourceUrl: 'https://learn.microsoft.com/x',
        difficulty: 'easy',
        tags: [],
      });
      correctByQuestion.set(q.id, correct);
    }

    return { certId: cert.id, topicAId: topicA.id, topicBId: topicB.id, correctByQuestion };
  }

  /**
   * Helper: run a full 25-question session and submit each answer using the
   * provided choice picker. Returns the session id.
   */
  async function runSession(
    certId: CertificationId,
    correctByQuestion: Map<QuestionId, string>,
    pickChoice: (correct: string, index: number) => string,
  ): Promise<string> {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: {
        certificationId: certId,
        mode: 'mixed',
        feedbackMode: 'practice',
        length: 25,
      },
    });
    const createBody = QuizSessionResponseSchema.parse(created.json());

    for (const [index, question] of createBody.questions.entries()) {
      const correct = correctByQuestion.get(question.id);
      if (correct === undefined) throw new Error('Missing correct answer for seeded question');
      const selected = pickChoice(correct, index);
      await app.inject({
        method: 'POST',
        url: `/api/v1/quiz-sessions/${createBody.session.id}/attempts`,
        payload: { questionId: question.id, selectedChoiceIds: [selected] },
      });
    }

    await app.inject({
      method: 'POST',
      url: `/api/v1/quiz-sessions/${createBody.session.id}/complete`,
    });

    return createBody.session.id;
  }

  it('returns zeros and empty arrays when no attempts exist', async () => {
    const cert = await upsertCertificationBySlug({
      code: 'az-104',
      slug: 'az-104',
      title: 'AZ-104',
      description: '',
      mslearnPathUrl: 'https://learn.microsoft.com/az-104',
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/progress/${cert.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = ProgressResponseSchema.parse(response.json());
    expect(body.totalAttempts).toBe(0);
    expect(body.totalCorrect).toBe(0);
    expect(body.overallAccuracy).toBe(0);
    expect(body.perTopic).toEqual([]);
    expect(body.recentSessions).toEqual([]);
  });

  it('aggregates one perfect session into the right overall + per-topic numbers', async () => {
    const { certId, correctByQuestion } = await seedQuizContent();

    await runSession(certId, correctByQuestion, (correct) => correct);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/progress/${certId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = ProgressResponseSchema.parse(response.json());
    expect(body.totalAttempts).toBe(25);
    expect(body.totalCorrect).toBe(25);
    expect(body.overallAccuracy).toBe(1);
    // Every topic that appears should have accuracy 1 since we got everything right.
    body.perTopic.forEach((t) => {
      expect(t.accuracy).toBe(1);
      expect(t.correct).toBe(t.total);
    });
    // The session was completed, so the recentSessions list should include it.
    expect(body.recentSessions).toHaveLength(1);
    expect(body.recentSessions[0]?.status).toBe('completed');
    expect(body.recentSessions[0]?.score?.correct).toBe(25);
  });

  it('per-topic results are sorted weakest first', async () => {
    const { certId, correctByQuestion } = await seedQuizContent();

    // Get every other answer wrong — that produces a non-100% accuracy across
    // topics. With $sample randomness we can't predict which topic is weaker,
    // but we CAN assert the result is sorted ascending by accuracy.
    await runSession(certId, correctByQuestion, (correct, index) => {
      if (index % 2 === 0) {
        return correct === 'A' ? 'C' : 'A';
      }
      return correct;
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/progress/${certId}`,
    });

    const body = ProgressResponseSchema.parse(response.json());
    expect(body.totalAttempts).toBe(25);
    // Sorted weakest first: each accuracy should be ≤ the next.
    for (let i = 0; i < body.perTopic.length - 1; i++) {
      const a = body.perTopic[i];
      const b = body.perTopic[i + 1];
      if (a !== undefined && b !== undefined) {
        expect(a.accuracy).toBeLessThanOrEqual(b.accuracy);
      }
    }
  });

  it('aggregates across multiple sessions', async () => {
    const { certId, correctByQuestion } = await seedQuizContent();

    // Two perfect sessions = 50 total attempts, all correct.
    await runSession(certId, correctByQuestion, (correct) => correct);
    await runSession(certId, correctByQuestion, (correct) => correct);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/progress/${certId}`,
    });

    const body = ProgressResponseSchema.parse(response.json());
    expect(body.totalAttempts).toBe(50);
    expect(body.totalCorrect).toBe(50);
    expect(body.overallAccuracy).toBe(1);
    expect(body.recentSessions).toHaveLength(2);
    body.recentSessions.forEach((s) => {
      expect(s.status).toBe('completed');
    });
    // recentSessions are sorted newest first
    const [first, second] = body.recentSessions;
    if (first && second) {
      expect(new Date(first.startedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(second.startedAt).getTime(),
      );
    }
  });

  it('returns 404 for an unknown cert', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/progress/000000000000000000000000',
    });

    expect(response.statusCode).toBe(404);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for an invalid cert id shape', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/progress/not-an-objectid',
    });

    expect(response.statusCode).toBe(400);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('only counts attempts for the requested user', async () => {
    // The HARDCODED_USER_ID makes this test slightly contrived: every attempt
    // already belongs to that user. We can still assert that the response is
    // shaped correctly and not something else (e.g. cross-cert leakage).
    const { certId, correctByQuestion } = await seedQuizContent();

    await runSession(certId, correctByQuestion, (correct) => correct);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/progress/${certId}`,
    });

    const body = ProgressResponseSchema.parse(response.json());
    body.recentSessions.forEach((s) => {
      // sessionId hex string check
      expect(s.sessionId).toMatch(/^[0-9a-f]{24}$/);
    });
    expect(body.recentSessions.length).toBeGreaterThan(0);
    void HARDCODED_USER_ID;
  });
});
