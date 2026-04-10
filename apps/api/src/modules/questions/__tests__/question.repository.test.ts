import type { CertificationId, QuestionInput, TopicId } from '@acpt/shared';

import { clearTestDb, startTestDb, stopTestDb } from '../../../../test/setup-db.js';
import { upsertCertificationBySlug } from '../../certifications/certification.repository.js';
import { upsertTopicBySlug } from '../../topics/topic.repository.js';
import {
  findQuestionsByCertification,
  sampleQuestions,
  upsertQuestionByExternalId,
} from '../question.repository.js';

describe('question repository', () => {
  beforeAll(startTestDb);
  afterAll(stopTestDb);
  afterEach(clearTestDb);

  async function seedCertAndTopics(): Promise<{
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

  function makeQuestion(
    overrides: Partial<QuestionInput> &
      Pick<QuestionInput, 'certificationId' | 'topicId' | 'externalId'>,
  ): QuestionInput {
    return {
      prompt: 'What service provides centralized identity management in Azure?',
      choices: [
        { id: 'A', text: 'Azure Storage' },
        { id: 'B', text: 'Microsoft Entra ID' },
        { id: 'C', text: 'Azure Monitor' },
        { id: 'D', text: 'Azure Policy' },
      ],
      correctChoiceIds: ['B'],
      explanation: 'Microsoft Entra ID (formerly Azure AD) is the identity service.',
      sourceUrl: 'https://learn.microsoft.com/entra',
      difficulty: 'easy' as const,
      tags: ['identity'],
      ...overrides,
    };
  }

  it('returns an empty list when no questions exist', async () => {
    const { certId } = await seedCertAndTopics();

    const questions = await findQuestionsByCertification(certId);

    expect(questions).toEqual([]);
  });

  it('upserts a question and returns it', async () => {
    const { certId, topicAId } = await seedCertAndTopics();

    await upsertQuestionByExternalId(
      makeQuestion({ certificationId: certId, topicId: topicAId, externalId: 'q1' }),
    );

    const questions = await findQuestionsByCertification(certId);
    expect(questions).toHaveLength(1);
    expect(questions[0]?.externalId).toBe('q1');
    expect(questions[0]?.choices).toHaveLength(4);
    expect(questions[0]?.correctChoiceIds).toEqual(['B']);
  });

  it('upsert is idempotent on externalId', async () => {
    const { certId, topicAId } = await seedCertAndTopics();

    const first = await upsertQuestionByExternalId(
      makeQuestion({ certificationId: certId, topicId: topicAId, externalId: 'q1' }),
    );
    const second = await upsertQuestionByExternalId(
      makeQuestion({
        certificationId: certId,
        topicId: topicAId,
        externalId: 'q1',
        prompt: 'Updated prompt',
      }),
    );

    expect(second.id).toBe(first.id);
    expect(second.prompt).toBe('Updated prompt');

    const all = await findQuestionsByCertification(certId);
    expect(all).toHaveLength(1);
  });

  it('filters by topicId when provided', async () => {
    const { certId, topicAId, topicBId } = await seedCertAndTopics();

    await upsertQuestionByExternalId(
      makeQuestion({ certificationId: certId, topicId: topicAId, externalId: 'a-1' }),
    );
    await upsertQuestionByExternalId(
      makeQuestion({ certificationId: certId, topicId: topicBId, externalId: 'b-1' }),
    );

    const a = await findQuestionsByCertification(certId, topicAId);
    const b = await findQuestionsByCertification(certId, topicBId);

    expect(a).toHaveLength(1);
    expect(a[0]?.externalId).toBe('a-1');
    expect(b).toHaveLength(1);
    expect(b[0]?.externalId).toBe('b-1');
  });

  it('sampleQuestions returns N random questions and respects topic filter', async () => {
    const { certId, topicAId, topicBId } = await seedCertAndTopics();

    for (let i = 0; i < 10; i++) {
      await upsertQuestionByExternalId(
        makeQuestion({
          certificationId: certId,
          topicId: i < 5 ? topicAId : topicBId,
          externalId: `q-${String(i)}`,
        }),
      );
    }

    const sampled = await sampleQuestions(certId, 3);
    expect(sampled).toHaveLength(3);

    const sampledA = await sampleQuestions(certId, 10, topicAId);
    expect(sampledA).toHaveLength(5);
    sampledA.forEach((q) => {
      expect(q.topicId).toBe(topicAId);
    });
  });
});
