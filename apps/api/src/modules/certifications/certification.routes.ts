import {
  CertIdParamsSchema,
  CertificationDetailResponseSchema,
  CertificationListResponseSchema,
} from '@acpt/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { getCertificationHandler, listCertificationsHandler } from './certification.controller.js';

export function registerCertificationRoutes(app: FastifyInstance): void {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get(
    '/certifications',
    {
      schema: {
        tags: ['certifications'],
        summary: 'List all certifications',
        response: {
          200: CertificationListResponseSchema,
        },
      },
    },
    listCertificationsHandler,
  );

  typed.get(
    '/certifications/:certId',
    {
      schema: {
        tags: ['certifications'],
        summary: 'Get a certification by id',
        params: CertIdParamsSchema,
        response: {
          200: CertificationDetailResponseSchema,
        },
      },
    },
    getCertificationHandler,
  );
}
