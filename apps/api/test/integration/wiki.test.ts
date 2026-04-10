import {
  ErrorEnvelopeSchema,
  WikiArticleListResponseSchema,
  WikiArticleSchema,
} from '@acpt/shared';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '../../src/app.js';
import { upsertCertificationBySlug } from '../../src/modules/certifications/certification.repository.js';
import { upsertTopicBySlug } from '../../src/modules/topics/topic.repository.js';
import { upsertArticleBySlug } from '../../src/modules/wiki/wiki.repository.js';
import { clearTestDb, startTestDb, stopTestDb } from '../setup-db.js';

describe('wiki HTTP', () => {
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
    const articleA = await upsertArticleBySlug({
      certificationId: cert.id,
      topicId: topicA.id,
      slug: 'azure-ad',
      title: 'Azure AD',
      summary: 'Identity intro',
      body: '# Azure AD\n\nbody',
      sourceUrl: 'https://learn.microsoft.com/entra',
      tags: ['identity'],
      readingTimeMinutes: 4,
    });
    const articleB = await upsertArticleBySlug({
      certificationId: cert.id,
      topicId: topicB.id,
      slug: 'vm-basics',
      title: 'VM Basics',
      summary: 'Compute intro',
      body: '# VMs\n\nbody',
      sourceUrl: 'https://learn.microsoft.com/vm',
      tags: ['compute'],
      readingTimeMinutes: 5,
    });
    return {
      certId: cert.id,
      topicAId: topicA.id,
      articleAId: articleA.id,
      articleBId: articleB.id,
    };
  }

  it('GET /api/v1/certifications/:certId/wiki returns all articles', async () => {
    const { certId } = await seed();

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/certifications/${certId}/wiki`,
    });

    expect(response.statusCode).toBe(200);
    const body = WikiArticleListResponseSchema.parse(response.json());
    expect(body.items).toHaveLength(2);
  });

  it('GET /api/v1/certifications/:certId/wiki?topicId=... filters by topic', async () => {
    const { certId, topicAId } = await seed();

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/certifications/${certId}/wiki?topicId=${topicAId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = WikiArticleListResponseSchema.parse(response.json());
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.slug).toBe('azure-ad');
  });

  it('GET /api/v1/certifications/:certId/wiki returns 404 when cert is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/certifications/000000000000000000000000/wiki',
    });

    expect(response.statusCode).toBe(404);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/v1/certifications/:certId/wiki returns 404 when filter topicId is missing', async () => {
    const { certId } = await seed();

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/certifications/${certId}/wiki?topicId=000000000000000000000000`,
    });

    expect(response.statusCode).toBe(404);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/v1/wiki/:articleId returns the full article with body', async () => {
    const { articleAId } = await seed();

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/wiki/${articleAId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = WikiArticleSchema.parse(response.json());
    expect(body.id).toBe(articleAId);
    expect(body.body).toContain('Azure AD');
  });

  it('GET /api/v1/wiki/:articleId returns 404 for missing article', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/wiki/000000000000000000000000',
    });

    expect(response.statusCode).toBe(404);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
