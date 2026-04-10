import {
  AttemptResultResponseSchema,
  ErrorEnvelopeSchema,
  HARDCODED_USER_ID,
  QuizSessionResponseSchema,
  QuizSessionSummaryResponseSchema,
  type CertificationId,
  type QuestionId,
  type TopicId,
} from '@acpt/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { buildApp } from '../../src/app.js';
import { upsertCertificationBySlug } from '../../src/modules/certifications/certification.repository.js';
import { upsertQuestionByExternalId } from '../../src/modules/questions/question.repository.js';
import { upsertTopicBySlug } from '../../src/modules/topics/topic.repository.js';
import { clearTestDb, startTestDb, stopTestDb } from '../setup-db.js';

describe('quiz-sessions HTTP', () => {
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
   * Seed enough data to actually create a 25-question quiz: one cert, two
   * topics, 30 questions split across them. Returns the seeded ids and the
   * map of questionId → correct choice so the test can submit valid answers.
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
      // Alternate the correct answer between A and B so the test exercises both.
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
        explanation: `Explanation for question ${String(i)}`,
        sourceUrl: 'https://learn.microsoft.com/x',
        difficulty: 'easy',
        tags: [],
      });
      correctByQuestion.set(q.id, correct);
    }

    return { certId: cert.id, topicAId: topicA.id, topicBId: topicB.id, correctByQuestion };
  }

  it('POST /quiz-sessions creates a 25-question mixed practice session and strips the answer key from presented questions', async () => {
    const { certId } = await seedQuizContent();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: { certificationId: certId, mode: 'mixed', feedbackMode: 'practice', length: 25 },
    });

    expect(response.statusCode).toBe(200);
    const body = QuizSessionResponseSchema.parse(response.json());
    expect(body.session.status).toBe('in-progress');
    expect(body.session.length).toBe(25);
    expect(body.session.mode).toBe('mixed');
    expect(body.session.feedbackMode).toBe('practice');
    expect(body.session.questionIds).toHaveLength(25);
    expect(body.questions).toHaveLength(25);

    // PresentedQuestion does not include correctChoiceIds or explanation —
    // verified at runtime by the schema parse above (those fields aren't in
    // PresentedQuestionSchema). Defense-in-depth: spot-check the raw JSON.
    const raw = z
      .object({ questions: z.array(z.record(z.string(), z.unknown())) })
      .parse(response.json());
    raw.questions.forEach((q) => {
      expect(q).not.toHaveProperty('correctChoiceIds');
      expect(q).not.toHaveProperty('explanation');
    });
  });

  it('POST /quiz-sessions rejects single-topic mode without topicId', async () => {
    const { certId } = await seedQuizContent();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: {
        certificationId: certId,
        mode: 'single-topic',
        feedbackMode: 'practice',
        length: 25,
      },
    });

    expect(response.statusCode).toBe(400);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /quiz-sessions returns 409 when not enough questions exist', async () => {
    const cert = await upsertCertificationBySlug({
      code: 'az-104',
      slug: 'az-104',
      title: 'AZ-104',
      description: '',
      mslearnPathUrl: 'https://learn.microsoft.com/az-104',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: {
        certificationId: cert.id,
        mode: 'mixed',
        feedbackMode: 'practice',
        length: 25,
      },
    });

    expect(response.statusCode).toBe(409);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('CONFLICT');
  });

  it('GET /quiz-sessions/:sessionId resumes the session in original question order', async () => {
    const { certId } = await seedQuizContent();

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: { certificationId: certId, mode: 'mixed', feedbackMode: 'practice', length: 25 },
    });
    const createBody = QuizSessionResponseSchema.parse(created.json());

    const resumed = await app.inject({
      method: 'GET',
      url: `/api/v1/quiz-sessions/${createBody.session.id}`,
    });

    expect(resumed.statusCode).toBe(200);
    const resumedBody = QuizSessionResponseSchema.parse(resumed.json());
    expect(resumedBody.session.id).toBe(createBody.session.id);
    expect(resumedBody.questions.map((q) => q.id)).toEqual(createBody.questions.map((q) => q.id));
  });

  it('practice mode: full happy path → answer 25 correctly → complete returns 25/25 and each attempt reveals the answer', async () => {
    const { certId, correctByQuestion } = await seedQuizContent();

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: { certificationId: certId, mode: 'mixed', feedbackMode: 'practice', length: 25 },
    });
    const createBody = QuizSessionResponseSchema.parse(created.json());
    const sessionId = createBody.session.id;

    for (const question of createBody.questions) {
      const correct = correctByQuestion.get(question.id);
      expect(correct).toBeDefined();

      const attempt = await app.inject({
        method: 'POST',
        url: `/api/v1/quiz-sessions/${sessionId}/attempts`,
        payload: { questionId: question.id, selectedChoiceIds: [correct] },
      });

      expect(attempt.statusCode).toBe(200);
      const result = AttemptResultResponseSchema.parse(attempt.json());
      expect(result.questionId).toBe(question.id);
      // Practice mode: the response is the revealed variant of the union.
      if (!result.revealed) {
        throw new Error('Expected practice-mode response to reveal the answer key');
      }
      expect(result.isCorrect).toBe(true);
      expect(result.correctChoiceIds).toEqual([correct]);
      expect(result.explanation).toContain('Explanation for question');
      expect(result.sourceUrl).toMatch(/^https:/);
    }

    const completed = await app.inject({
      method: 'POST',
      url: `/api/v1/quiz-sessions/${sessionId}/complete`,
    });

    expect(completed.statusCode).toBe(200);
    const summary = QuizSessionSummaryResponseSchema.parse(completed.json());
    expect(summary.session.status).toBe('completed');
    expect(summary.session.completedAt).toBeDefined();
    expect(summary.session.score).toEqual(
      expect.objectContaining({
        correct: 25,
        total: 25,
      }),
    );
    expect(summary.session.userId).toBe(HARDCODED_USER_ID);
  });

  it('exam mode: each attempt response only acknowledges receipt and never leaks the answer key', async () => {
    const { certId, correctByQuestion } = await seedQuizContent();

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: { certificationId: certId, mode: 'mixed', feedbackMode: 'exam', length: 25 },
    });
    const createBody = QuizSessionResponseSchema.parse(created.json());
    expect(createBody.session.feedbackMode).toBe('exam');

    // Submit a single attempt and inspect the response shape
    const firstQuestion = createBody.questions[0];
    expect(firstQuestion).toBeDefined();
    if (!firstQuestion) return;

    const correct = correctByQuestion.get(firstQuestion.id);
    expect(correct).toBeDefined();

    const attempt = await app.inject({
      method: 'POST',
      url: `/api/v1/quiz-sessions/${createBody.session.id}/attempts`,
      payload: { questionId: firstQuestion.id, selectedChoiceIds: [correct] },
    });

    expect(attempt.statusCode).toBe(200);
    const result = AttemptResultResponseSchema.parse(attempt.json());
    expect(result.questionId).toBe(firstQuestion.id);
    expect(result.revealed).toBe(false);

    // Defense-in-depth: spot-check the raw JSON to confirm the answer key
    // and explanation are NOT present, even as null/undefined fields.
    const raw = z.record(z.string(), z.unknown()).parse(attempt.json());
    expect(raw).not.toHaveProperty('isCorrect');
    expect(raw).not.toHaveProperty('correctChoiceIds');
    expect(raw).not.toHaveProperty('explanation');
    expect(raw).not.toHaveProperty('sourceUrl');
  });

  it('exam mode: completing the session still produces an accurate score from persisted attempts', async () => {
    const { certId, correctByQuestion } = await seedQuizContent();

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: { certificationId: certId, mode: 'mixed', feedbackMode: 'exam', length: 25 },
    });
    const createBody = QuizSessionResponseSchema.parse(created.json());

    // Answer all 25 correctly even though the user can't see the result.
    for (const question of createBody.questions) {
      const correct = correctByQuestion.get(question.id);
      await app.inject({
        method: 'POST',
        url: `/api/v1/quiz-sessions/${createBody.session.id}/attempts`,
        payload: { questionId: question.id, selectedChoiceIds: [correct] },
      });
    }

    const completed = await app.inject({
      method: 'POST',
      url: `/api/v1/quiz-sessions/${createBody.session.id}/complete`,
    });
    const summary = QuizSessionSummaryResponseSchema.parse(completed.json());

    // The persisted attempts had isCorrect: true, so the final score adds up.
    expect(summary.session.score?.correct).toBe(25);
    expect(summary.session.score?.total).toBe(25);
  });

  it('mixed correct/incorrect answers produce the right score and per-topic breakdown', async () => {
    const { certId, topicAId, correctByQuestion } = await seedQuizContent();

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: { certificationId: certId, mode: 'mixed', feedbackMode: 'practice', length: 25 },
    });
    const createBody = QuizSessionResponseSchema.parse(created.json());

    // Answer all correctly except the first one — pick a wrong choice for it.
    for (const [index, question] of createBody.questions.entries()) {
      const correct = correctByQuestion.get(question.id);
      const selected = index === 0 ? (correct === 'A' ? 'C' : 'A') : correct;
      await app.inject({
        method: 'POST',
        url: `/api/v1/quiz-sessions/${createBody.session.id}/attempts`,
        payload: { questionId: question.id, selectedChoiceIds: [selected] },
      });
    }

    const completed = await app.inject({
      method: 'POST',
      url: `/api/v1/quiz-sessions/${createBody.session.id}/complete`,
    });
    const summary = QuizSessionSummaryResponseSchema.parse(completed.json());

    expect(summary.session.score?.correct).toBe(24);
    expect(summary.session.score?.total).toBe(25);
    const perTopic = summary.session.score?.perTopic ?? {};
    expect(Object.keys(perTopic).length).toBeGreaterThanOrEqual(1);
    const sumTotal = Object.values(perTopic).reduce((acc, t) => acc + t.total, 0);
    expect(sumTotal).toBe(25);
    void topicAId;
  });

  it('rejects an attempt for a question that is not part of the session', async () => {
    const { certId } = await seedQuizContent();

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quiz-sessions',
      payload: { certificationId: certId, mode: 'mixed', feedbackMode: 'practice', length: 25 },
    });
    const createBody = QuizSessionResponseSchema.parse(created.json());

    const attempt = await app.inject({
      method: 'POST',
      url: `/api/v1/quiz-sessions/${createBody.session.id}/attempts`,
      payload: {
        questionId: '000000000000000000000000',
        selectedChoiceIds: ['A'],
      },
    });

    expect(attempt.statusCode).toBe(400);
    const body = ErrorEnvelopeSchema.parse(attempt.json());
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /quiz-sessions/:sessionId returns 404 for an unknown session', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/quiz-sessions/000000000000000000000000',
    });

    expect(response.statusCode).toBe(404);
  });
});
