import { ErrorEnvelopeSchema, QuestionListResponseSchema } from '@acpt/shared';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '../../src/app.js';
import { upsertCertificationBySlug } from '../../src/modules/certifications/certification.repository.js';
import { upsertQuestionByExternalId } from '../../src/modules/questions/question.repository.js';
import { upsertTopicBySlug } from '../../src/modules/topics/topic.repository.js';
import { clearTestDb, startTestDb, stopTestDb } from '../setup-db.js';

describe('questions HTTP', () => {
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

  async function seed() {
    const cert = await upsertCertificationBySlug({
      code: 'az-104',
      slug: 'az-104',
      title: 'Microsoft Azure Administrator',
      description: '',
      mslearnPathUrl: 'https://learn.microsoft.com/az-104',
    });
    const topic = await upsertTopicBySlug({
      certificationId: cert.id,
      slug: 'identity',
      title: 'Identity',
      order: 1,
      description: '',
    });
    await upsertQuestionByExternalId({
      certificationId: cert.id,
      topicId: topic.id,
      externalId: 'q1',
      prompt: 'Identity question',
      choices: [
        { id: 'A', text: 'Wrong' },
        { id: 'B', text: 'Right' },
      ],
      correctChoiceIds: ['B'],
      explanation: 'Because.',
      sourceUrl: 'https://learn.microsoft.com/x',
      difficulty: 'easy',
      tags: ['identity'],
    });
    return { certId: cert.id, topicId: topic.id };
  }

  it('GET /api/v1/certifications/:certId/questions returns the questions', async () => {
    const { certId } = await seed();

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/certifications/${certId}/questions`,
    });

    expect(response.statusCode).toBe(200);
    const body = QuestionListResponseSchema.parse(response.json());
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.externalId).toBe('q1');
    expect(body.items[0]?.correctChoiceIds).toEqual(['B']);
  });

  it('GET .../questions?topicId=... filters by topic', async () => {
    const { certId, topicId } = await seed();

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/certifications/${certId}/questions?topicId=${topicId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = QuestionListResponseSchema.parse(response.json());
    expect(body.items).toHaveLength(1);
  });

  it('GET .../questions returns 404 when cert is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/certifications/000000000000000000000000/questions',
    });

    expect(response.statusCode).toBe(404);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
