import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { buildApp } from '../../src/app.js';

const healthzResponseSchema = z.object({ status: z.literal('ok') });

const openApiDocSchema = z.object({
  openapi: z.string(),
  paths: z.record(z.string(), z.unknown()),
});

describe('GET /healthz', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns ok status', async () => {
    const response = await app.inject({ method: 'GET', url: '/healthz' });

    expect(response.statusCode).toBe(200);
    const body = healthzResponseSchema.parse(response.json());
    expect(body.status).toBe('ok');
  });

  it('exposes the generated OpenAPI document via swagger', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' });

    expect(response.statusCode).toBe(200);
    const doc = openApiDocSchema.parse(response.json());
    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.paths['/healthz']).toBeDefined();
  });
});
