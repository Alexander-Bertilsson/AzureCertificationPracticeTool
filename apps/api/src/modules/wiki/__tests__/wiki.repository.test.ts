import type { CertificationId, TopicId, WikiArticleId } from '@acpt/shared';

import { clearTestDb, startTestDb, stopTestDb } from '../../../../test/setup-db.js';
import { upsertCertificationBySlug } from '../../certifications/certification.repository.js';
import { upsertTopicBySlug } from '../../topics/topic.repository.js';
import {
  findArticleById,
  findArticleBySlug,
  findArticlesByCertification,
  upsertArticleBySlug,
} from '../wiki.repository.js';

describe('wiki repository', () => {
  beforeAll(startTestDb);
  afterAll(stopTestDb);
  afterEach(clearTestDb);

  async function seedCertAndTopic(): Promise<{
    certId: CertificationId;
    topicAId: TopicId;
    topicBId: TopicId;
  }> {
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
    return { certId: cert.id, topicAId: topicA.id, topicBId: topicB.id };
  }

  it('returns an empty list when no articles exist', async () => {
    const { certId } = await seedCertAndTopic();

    const articles = await findArticlesByCertification(certId);

    expect(articles).toEqual([]);
  });

  it('upserts an article and returns it via findArticlesByCertification', async () => {
    const { certId, topicAId } = await seedCertAndTopic();

    await upsertArticleBySlug({
      certificationId: certId,
      topicId: topicAId,
      slug: 'azure-ad-overview',
      title: 'Azure AD Overview',
      summary: 'Quick intro to Entra ID.',
      body: '# Azure AD\n\nMarkdown body here.',
      sourceUrl: 'https://learn.microsoft.com/entra/overview',
      tags: ['identity', 'entra-id'],
      readingTimeMinutes: 4,
    });

    const articles = await findArticlesByCertification(certId);

    expect(articles).toHaveLength(1);
    expect(articles[0]?.slug).toBe('azure-ad-overview');
    expect(articles[0]?.body).toContain('Markdown body here');
    expect(articles[0]?.tags).toEqual(['identity', 'entra-id']);
  });

  it('filters articles by topicId when provided', async () => {
    const { certId, topicAId, topicBId } = await seedCertAndTopic();

    await upsertArticleBySlug({
      certificationId: certId,
      topicId: topicAId,
      slug: 'in-topic-a',
      title: 'In Topic A',
      summary: '',
      body: '...',
      sourceUrl: 'https://learn.microsoft.com/x',
      tags: [],
      readingTimeMinutes: 1,
    });
    await upsertArticleBySlug({
      certificationId: certId,
      topicId: topicBId,
      slug: 'in-topic-b',
      title: 'In Topic B',
      summary: '',
      body: '...',
      sourceUrl: 'https://learn.microsoft.com/y',
      tags: [],
      readingTimeMinutes: 1,
    });

    const onlyA = await findArticlesByCertification(certId, topicAId);
    const onlyB = await findArticlesByCertification(certId, topicBId);

    expect(onlyA).toHaveLength(1);
    expect(onlyA[0]?.slug).toBe('in-topic-a');
    expect(onlyB).toHaveLength(1);
    expect(onlyB[0]?.slug).toBe('in-topic-b');
  });

  it('upsert is idempotent on (certId, slug)', async () => {
    const { certId, topicAId } = await seedCertAndTopic();

    const first = await upsertArticleBySlug({
      certificationId: certId,
      topicId: topicAId,
      slug: 'doc',
      title: 'Doc',
      summary: '',
      body: 'v1',
      sourceUrl: 'https://learn.microsoft.com/x',
      tags: [],
      readingTimeMinutes: 1,
    });
    const second = await upsertArticleBySlug({
      certificationId: certId,
      topicId: topicAId,
      slug: 'doc',
      title: 'Doc (Updated)',
      summary: '',
      body: 'v2',
      sourceUrl: 'https://learn.microsoft.com/x',
      tags: [],
      readingTimeMinutes: 1,
    });

    expect(second.id).toBe(first.id);
    expect(second.title).toBe('Doc (Updated)');
    expect(second.body).toBe('v2');
  });

  it('findArticleBySlug and findArticleById return the inserted article', async () => {
    const { certId, topicAId } = await seedCertAndTopic();
    const inserted = await upsertArticleBySlug({
      certificationId: certId,
      topicId: topicAId,
      slug: 'doc',
      title: 'Doc',
      summary: '',
      body: '...',
      sourceUrl: 'https://learn.microsoft.com/x',
      tags: [],
      readingTimeMinutes: 1,
    });

    expect(await findArticleBySlug(certId, 'doc')).not.toBeNull();
    expect((await findArticleById(inserted.id))?.id).toBe(inserted.id);
  });

  it('findArticleById returns null for an invalid id string', async () => {
    const bogus = 'not-an-objectid' as WikiArticleId;

    const article = await findArticleById(bogus);

    expect(article).toBeNull();
  });
});
