import type { CertificationId } from '@acpt/shared';

import { clearTestDb, startTestDb, stopTestDb } from '../../../../test/setup-db.js';
import {
  findAllCertifications,
  findCertificationById,
  findCertificationBySlug,
  upsertCertificationBySlug,
} from '../certification.repository.js';

describe('certification repository', () => {
  beforeAll(startTestDb);
  afterAll(stopTestDb);
  afterEach(clearTestDb);

  const az104 = {
    code: 'az-104',
    slug: 'az-104',
    title: 'Microsoft Azure Administrator',
    description: 'AZ-104 study material',
    mslearnPathUrl:
      'https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/',
  };

  it('returns an empty list when no certs exist', async () => {
    const certs = await findAllCertifications();

    expect(certs).toEqual([]);
  });

  it('upserts a new cert and returns it with timestamps and a branded id', async () => {
    const inserted = await upsertCertificationBySlug(az104);

    expect(inserted.slug).toBe('az-104');
    expect(inserted.title).toBe(az104.title);
    expect(inserted.id).toMatch(/^[0-9a-f]{24}$/);
    expect(inserted.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('upsert is idempotent on slug — a second upsert updates in place', async () => {
    const first = await upsertCertificationBySlug(az104);
    const second = await upsertCertificationBySlug({ ...az104, title: 'Updated Title' });

    expect(second.id).toBe(first.id);
    expect(second.title).toBe('Updated Title');

    const all = await findAllCertifications();
    expect(all).toHaveLength(1);
  });

  it('findCertificationBySlug returns the inserted cert', async () => {
    await upsertCertificationBySlug(az104);

    const found = await findCertificationBySlug('az-104');

    expect(found).not.toBeNull();
    expect(found?.slug).toBe('az-104');
  });

  it('findCertificationBySlug returns null for a missing slug', async () => {
    const found = await findCertificationBySlug('nope');

    expect(found).toBeNull();
  });

  it('findCertificationById returns the inserted cert', async () => {
    const inserted = await upsertCertificationBySlug(az104);

    const found = await findCertificationById(inserted.id);

    expect(found?.id).toBe(inserted.id);
  });

  it('findCertificationById returns null for a valid-but-missing id', async () => {
    const missingId = '000000000000000000000000' as CertificationId;

    const found = await findCertificationById(missingId);

    expect(found).toBeNull();
  });

  it('findCertificationById returns null for an invalid id string', async () => {
    const bogus = 'not-an-objectid' as CertificationId;

    const found = await findCertificationById(bogus);

    expect(found).toBeNull();
  });
});
