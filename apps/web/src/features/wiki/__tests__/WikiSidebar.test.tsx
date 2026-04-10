import type { CertificationId, Topic, TopicId } from '@acpt/shared';
import { render } from '@testing-library/react-native';

import { flattenStyle } from '../../../test-utils/flatten-style';
import { tokens } from '../../../theme/tokens';
import { WikiSidebar } from '../WikiSidebar';

const CERT_ID = '507f1f77bcf86cd799439011' as CertificationId;
const IDENTITY_ID = '507f1f77bcf86cd799439021' as TopicId;
const STORAGE_ID = '507f1f77bcf86cd799439022' as TopicId;

function makeTopic(id: TopicId, slug: string, title: string, order: number): Topic {
  return {
    id,
    certificationId: CERT_ID,
    slug,
    title,
    order,
    description: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('WikiSidebar', () => {
  const topics = [
    makeTopic(STORAGE_ID, 'storage', 'Storage', 1),
    makeTopic(IDENTITY_ID, 'identity', 'Identity', 0),
  ];

  it('lists topics sorted by order and shows the All topics entry', () => {
    const { getByTestId } = render(
      <WikiSidebar
        certificationId={CERT_ID}
        topics={topics}
        isLoadingTopics={false}
        activeTopicId={null}
      />,
    );

    expect(getByTestId('sidebar-all-topics')).toBeTruthy();
    expect(getByTestId('sidebar-topic-identity')).toBeTruthy();
    expect(getByTestId('sidebar-topic-storage')).toBeTruthy();
  });

  it('highlights "All topics" when activeTopicId is null', () => {
    const { getByTestId } = render(
      <WikiSidebar
        certificationId={CERT_ID}
        topics={topics}
        isLoadingTopics={false}
        activeTopicId={null}
      />,
    );

    const active = flattenStyle(getByTestId('sidebar-all-topics').props.style);
    const inactive = flattenStyle(getByTestId('sidebar-topic-identity').props.style);
    expect(active['backgroundColor']).toBe(tokens.colors.surface);
    expect(inactive['backgroundColor']).toBe('transparent');
  });

  it('highlights the matching topic when activeTopicId is set', () => {
    const { getByTestId } = render(
      <WikiSidebar
        certificationId={CERT_ID}
        topics={topics}
        isLoadingTopics={false}
        activeTopicId={IDENTITY_ID}
      />,
    );

    const active = flattenStyle(getByTestId('sidebar-topic-identity').props.style);
    const all = flattenStyle(getByTestId('sidebar-all-topics').props.style);
    expect(active['backgroundColor']).toBe(tokens.colors.surface);
    expect(all['backgroundColor']).toBe('transparent');
  });

  it('shows the loading spinner while topics are fetching', () => {
    const { getByLabelText, queryByTestId } = render(
      <WikiSidebar
        certificationId={CERT_ID}
        topics={[]}
        isLoadingTopics={true}
        activeTopicId={null}
      />,
    );

    expect(getByLabelText('Loading topics')).toBeTruthy();
    expect(queryByTestId('sidebar-all-topics')).toBeNull();
  });
});
