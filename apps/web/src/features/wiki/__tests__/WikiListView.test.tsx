import type { CertificationId, Topic, TopicId, WikiArticle, WikiArticleId } from '@acpt/shared';
import { render } from '@testing-library/react-native';

import { WikiListView } from '../WikiListView';

const CERT_ID = '507f1f77bcf86cd799439011' as CertificationId;
const IDENTITY_TOPIC_ID = '507f1f77bcf86cd799439021' as TopicId;
const STORAGE_TOPIC_ID = '507f1f77bcf86cd799439022' as TopicId;

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: IDENTITY_TOPIC_ID,
    certificationId: CERT_ID,
    slug: 'identity',
    title: 'Manage Azure identities',
    order: 0,
    description: 'Entra ID and RBAC.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeArticle(overrides: Partial<WikiArticle> = {}): WikiArticle {
  return {
    id: '507f1f77bcf86cd799439031' as WikiArticleId,
    certificationId: CERT_ID,
    topicId: IDENTITY_TOPIC_ID,
    slug: 'entra-id-overview',
    title: 'Entra ID Overview',
    summary: 'What Entra ID is and when you use it.',
    body: '# heading\n\nbody',
    sourceUrl: 'https://learn.microsoft.com/overview',
    tags: ['identity'],
    readingTimeMinutes: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('WikiListView', () => {
  it('shows a spinner when loading', () => {
    const { getByLabelText } = render(<WikiListView state={{ status: 'loading' }} />);
    expect(getByLabelText('Loading wiki')).toBeTruthy();
  });

  it('shows the error message on error', () => {
    const { getByText } = render(<WikiListView state={{ status: 'error', message: 'api down' }} />);
    expect(getByText('api down')).toBeTruthy();
  });

  it('groups articles under their topics, sorted by topic order', () => {
    const identity = makeTopic();
    const storage = makeTopic({
      id: STORAGE_TOPIC_ID,
      slug: 'storage',
      title: 'Implement and manage storage',
      order: 1,
      description: 'Storage accounts.',
    });

    const identityArticle = makeArticle();
    const storageArticle = makeArticle({
      id: '507f1f77bcf86cd799439032' as WikiArticleId,
      topicId: STORAGE_TOPIC_ID,
      slug: 'storage-accounts-overview',
      title: 'Storage Accounts Overview',
      summary: 'Blob, file, queue, table.',
    });

    const { getByText, getByTestId } = render(
      <WikiListView
        state={{
          status: 'success',
          topics: [storage, identity],
          articles: [storageArticle, identityArticle],
          activeTopicId: null,
        }}
      />,
    );

    expect(getByText('Manage Azure identities')).toBeTruthy();
    expect(getByText('Implement and manage storage')).toBeTruthy();
    expect(getByTestId('wiki-card-entra-id-overview')).toBeTruthy();
    expect(getByTestId('wiki-card-storage-accounts-overview')).toBeTruthy();
  });

  it('shows an empty-topic message when a topic has no articles', () => {
    const { getByText } = render(
      <WikiListView
        state={{
          status: 'success',
          topics: [makeTopic()],
          articles: [],
          activeTopicId: null,
        }}
      />,
    );
    expect(getByText('No articles for this topic yet.')).toBeTruthy();
  });

  it('shows only the chosen topic as a hero when activeTopicId is set', () => {
    const identity = makeTopic();
    const identityArticle = makeArticle();

    const { getByText, queryByText } = render(
      <WikiListView
        state={{
          status: 'success',
          topics: [identity],
          articles: [identityArticle],
          activeTopicId: IDENTITY_TOPIC_ID,
        }}
      />,
    );

    // Topic title becomes the hero heading.
    expect(getByText(identity.title)).toBeTruthy();
    expect(getByText(identity.description)).toBeTruthy();
    // No "Topic 01" eyebrow since the sidebar has already answered that.
    expect(queryByText('Topic 01')).toBeNull();
  });
});
