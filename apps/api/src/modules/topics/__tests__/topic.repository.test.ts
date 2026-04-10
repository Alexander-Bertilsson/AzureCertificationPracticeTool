import type { CertificationId, TopicId } from '@acpt/shared';

import { clearTestDb, startTestDb, stopTestDb } from '../../../../test/setup-db.js';
import { upsertCertificationBySlug } from '../../certifications/certification.repository.js';
import {
  findTopicById,
  findTopicBySlug,
  findTopicsByCertification,
  upsertTopicBySlug,
} from '../topic.repository.js';

describe('topic repository', () => {
  beforeAll(startTestDb);
  afterAll(stopTestDb);
  afterEach(clearTestDb);

  async function seedCert(): Promise<CertificationId> {
    const cert = await upsertCertificationBySlug({
      code: 'az-104',
      slug: 'az-104',
      title: 'Microsoft Azure Administrator',
      description: '',
      mslearnPathUrl: 'https://learn.microsoft.com/az-104',
    });
    return cert.id;
  }

  it('returns an empty list when a cert has no topics', async () => {
    const certId = await seedCert();

    const topics = await findTopicsByCertification(certId);

    expect(topics).toEqual([]);
  });

  it('upserts a topic and returns it ordered by `order` ascending', async () => {
    const certId = await seedCert();

    await upsertTopicBySlug({
      certificationId: certId,
      slug: 'compute',
      title: 'Compute',
      order: 2,
      description: 'VMs and containers',
    });
    await upsertTopicBySlug({
      certificationId: certId,
      slug: 'identity',
      title: 'Identity & Governance',
      order: 1,
      description: 'Entra ID, RBAC',
    });

    const topics = await findTopicsByCertification(certId);

    expect(topics).toHaveLength(2);
    expect(topics[0]?.slug).toBe('identity');
    expect(topics[1]?.slug).toBe('compute');
  });

  it('upsert is idempotent on (certificationId, slug)', async () => {
    const certId = await seedCert();

    const first = await upsertTopicBySlug({
      certificationId: certId,
      slug: 'compute',
      title: 'Compute',
      order: 1,
      description: '',
    });
    const second = await upsertTopicBySlug({
      certificationId: certId,
      slug: 'compute',
      title: 'Compute (Updated)',
      order: 1,
      description: '',
    });

    expect(second.id).toBe(first.id);
    expect(second.title).toBe('Compute (Updated)');

    const all = await findTopicsByCertification(certId);
    expect(all).toHaveLength(1);
  });

  it('the same slug can exist in two different certifications', async () => {
    const certA = await seedCert();
    const certB = await upsertCertificationBySlug({
      code: 'az-204',
      slug: 'az-204',
      title: 'Azure Developer',
      description: '',
      mslearnPathUrl: 'https://learn.microsoft.com/az-204',
    });

    const a = await upsertTopicBySlug({
      certificationId: certA,
      slug: 'compute',
      title: 'Compute (104)',
      order: 1,
      description: '',
    });
    const b = await upsertTopicBySlug({
      certificationId: certB.id,
      slug: 'compute',
      title: 'Compute (204)',
      order: 1,
      description: '',
    });

    expect(a.id).not.toBe(b.id);
  });

  it('findTopicBySlug returns the matching topic', async () => {
    const certId = await seedCert();
    await upsertTopicBySlug({
      certificationId: certId,
      slug: 'compute',
      title: 'Compute',
      order: 1,
      description: '',
    });

    const topic = await findTopicBySlug(certId, 'compute');

    expect(topic?.slug).toBe('compute');
  });

  it('findTopicBySlug returns null for a missing slug', async () => {
    const certId = await seedCert();

    const topic = await findTopicBySlug(certId, 'nope');

    expect(topic).toBeNull();
  });

  it('findTopicById returns null for a missing id', async () => {
    const missingId = '000000000000000000000000' as TopicId;

    const topic = await findTopicById(missingId);

    expect(topic).toBeNull();
  });
});
