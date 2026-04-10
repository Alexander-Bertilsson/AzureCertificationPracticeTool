import {
  CertificationListResponseSchema,
  CertificationSchema,
  ErrorEnvelopeSchema,
} from '@acpt/shared';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '../../src/app.js';
import { upsertCertificationBySlug } from '../../src/modules/certifications/certification.repository.js';
import { clearTestDb, startTestDb, stopTestDb } from '../setup-db.js';

describe('certifications HTTP', () => {
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

  const az104 = {
    code: 'az-104',
    slug: 'az-104',
    title: 'Microsoft Azure Administrator',
    description: 'test description',
    mslearnPathUrl:
      'https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/',
  };

  it('GET /api/v1/certifications returns an empty list', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/certifications' });

    expect(response.statusCode).toBe(200);
    const body = CertificationListResponseSchema.parse(response.json());
    expect(body.items).toEqual([]);
  });

  it('GET /api/v1/certifications returns the seeded cert', async () => {
    await upsertCertificationBySlug(az104);

    const response = await app.inject({ method: 'GET', url: '/api/v1/certifications' });

    expect(response.statusCode).toBe(200);
    const body = CertificationListResponseSchema.parse(response.json());
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.slug).toBe('az-104');
    expect(body.items[0]?.title).toBe(az104.title);
  });

  it('GET /api/v1/certifications/:certId returns the cert', async () => {
    const cert = await upsertCertificationBySlug(az104);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/certifications/${cert.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = CertificationSchema.parse(response.json());
    expect(body.id).toBe(cert.id);
    expect(body.slug).toBe('az-104');
  });

  it('GET /api/v1/certifications/:certId returns 404 when missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/certifications/000000000000000000000000',
    });

    expect(response.statusCode).toBe(404);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.requestId).not.toBe('');
  });

  it('GET /api/v1/certifications/:certId returns 400 for an invalid id shape', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/certifications/not-an-objectid',
    });

    expect(response.statusCode).toBe(400);
    const body = ErrorEnvelopeSchema.parse(response.json());
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
