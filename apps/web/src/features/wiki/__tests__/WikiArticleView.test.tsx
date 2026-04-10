import type { CertificationId, TopicId, WikiArticle, WikiArticleId } from '@acpt/shared';
import { render } from '@testing-library/react-native';
import type * as ReactType from 'react';
import type * as ReactNativeType from 'react-native';

import { WikiArticleView } from '../WikiArticleView';

// Replace the markdown renderer with a passthrough text so tests don't pull in
// its internals. The real component is exercised in dev via the live API.
jest.mock('react-native-markdown-display', () => {
  const React = jest.requireActual<typeof ReactType>('react');
  const RN = jest.requireActual<typeof ReactNativeType>('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children: string }) =>
      React.createElement(RN.Text, { testID: 'markdown-body' }, children),
  };
});

function makeArticle(overrides: Partial<WikiArticle> = {}): WikiArticle {
  return {
    id: '507f1f77bcf86cd799439031' as WikiArticleId,
    certificationId: '507f1f77bcf86cd799439011' as CertificationId,
    topicId: '507f1f77bcf86cd799439021' as TopicId,
    slug: 'entra-id-overview',
    title: 'Entra ID Overview',
    summary: 'What Entra ID is and when to use it.',
    body: '# hello\n\nworld',
    sourceUrl: 'https://learn.microsoft.com/overview',
    tags: ['identity', 'entra-id'],
    readingTimeMinutes: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('WikiArticleView', () => {
  it('shows a spinner when loading', () => {
    const { getByLabelText } = render(<WikiArticleView state={{ status: 'loading' }} />);
    expect(getByLabelText('Loading article')).toBeTruthy();
  });

  it('shows the error message on error', () => {
    const { getByText } = render(<WikiArticleView state={{ status: 'error', message: 'gone' }} />);
    expect(getByText('gone')).toBeTruthy();
  });

  it('renders title, reading time, tags, and the markdown body', () => {
    const { getByText, getByTestId } = render(
      <WikiArticleView state={{ status: 'success', article: makeArticle() }} />,
    );

    expect(getByText('Entra ID Overview')).toBeTruthy();
    expect(getByText('4 min read')).toBeTruthy();
    expect(getByText('identity')).toBeTruthy();
    expect(getByText('entra-id')).toBeTruthy();
    expect(getByTestId('markdown-body').props.children).toBe('# hello\n\nworld');
  });
});
