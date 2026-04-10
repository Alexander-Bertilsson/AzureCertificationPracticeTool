import type { CertIdParams, Certification, CertificationListResponse } from '@acpt/shared';
import type { FastifyRequest } from 'fastify';

import { listCertifications, requireCertification } from './certification.service.js';

export async function listCertificationsHandler(): Promise<CertificationListResponse> {
  const items = await listCertifications();
  return { items };
}

export async function getCertificationHandler(
  req: FastifyRequest<{ Params: CertIdParams }>,
): Promise<Certification> {
  return requireCertification(req.params.certId);
}
