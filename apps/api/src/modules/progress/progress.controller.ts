import { HARDCODED_USER_ID, type CertIdParams, type ProgressResponse } from '@acpt/shared';
import type { FastifyRequest } from 'fastify';

import { getProgressForCertification } from './progress.service.js';

export async function getProgressHandler(
  req: FastifyRequest<{ Params: CertIdParams }>,
): Promise<ProgressResponse> {
  return getProgressForCertification(HARDCODED_USER_ID, req.params.certId);
}
