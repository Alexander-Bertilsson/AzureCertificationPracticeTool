import { ErrorEnvelopeSchema, TopicListResponseSchema } from '@acpt/shared';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '../../src/app.js';
import { upsertCertificationBySlug } from '../../src/modules/certifications/certification.repository.js';
import { upsertTopicBySlug } from '../../src/modules/topics/topic.repository.js';
import { clearTestDb, startTestDb, stopTestDb } from '../setup-db.js';

describe('topics HTTP', () => {
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

  async function seedCertWithTopics(): Promise<{ certId: string }> {
    const cert = await upsertCertificationBySlug({
      code: 'az-104',
      slug: 'az-104',
      title: 'Microsoft Azure Administrator',
      description: '',
      mslearnPathUrl: 'https://learn.microsoft.com/az-104',
    });
    await upsertTopicBySlug({
      certificationId: cert.id,
      slug: 'compute',
      title: 'Compute',
      order: 2,
      description: '',
    });
    await upsertTopicBySlug({
      certificationId: cert.id,
      slug: 'identity',
      title: 'Identity',
      order: 1,
      description: '',
    });
    return { certId: cert.id };
  }

  it('GET /api/v1/certifications/:certId/topics returns topics ordered by `order`', async () => {
    const { certId } = await seedCertWithTopics();

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/certifications/${certId}/topics`,
    });

    expect(response.statusCode).toBe(200);
    const body = TopicListResponseSchema.parse(response.json());
    expect(body.items).toHaveLength(2);
    expect(body.items[0]?.slug).toBe('identity');
    expect(body.items[1]?.slug).toBe('compute');
  });

  it('GET /api/v1/certifications/:certId/topics returns 404 when the cert is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/certifications/000000000000000000000000/topics',
    });

    expect(response.statusCode).toBe(404);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/v1/certifications/:certId/topics returns 400 for an invalid cert id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/certifications/not-an-objectid/topics',
    });

    expect(response.statusCode).toBe(400);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
