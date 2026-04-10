import type { Certification, CertificationId } from '@acpt/shared';

import { NotFoundError } from '../../common/errors/not-found-error.js';

import { findAllCertifications, findCertificationById } from './certification.repository.js';

export async function listCertifications(): Promise<Certification[]> {
  return findAllCertifications();
}

export async function getCertification(id: CertificationId): Promise<Certification | null> {
  return findCertificationById(id);
}

/**
 * Fetch a certification by id. Throws `NotFoundError` when absent — the
 * `require*` name is the signal that this function treats absence as a
 * contract violation (see docs/adr/0004).
 */
export async function requireCertification(id: CertificationId): Promise<Certification> {
  const cert = await findCertificationById(id);
  if (cert === null) {
    throw new NotFoundError(`Certification not found: ${id}`);
  }
  return cert;
}
