import type { CertificationId, ProgressResponse, QuizSessionId, TopicId } from '@acpt/shared';
import { render } from '@testing-library/react-native';

import { ProgressView } from '../ProgressView';

const CERT_ID = '507f1f77bcf86cd799439011' as CertificationId;
const IDENTITY_ID = '507f1f77bcf86cd799439021' as TopicId;
const STORAGE_ID = '507f1f77bcf86cd799439022' as TopicId;
const SESSION_ID = '507f1f77bcf86cd799439051' as QuizSessionId;

function makeProgress(overrides: Partial<ProgressResponse> = {}): ProgressResponse {
  return {
    certificationId: CERT_ID,
    totalAttempts: 50,
    totalCorrect: 36,
    overallAccuracy: 0.72,
    perTopic: [
      {
        topicId: STORAGE_ID,
        topicSlug: 'storage',
        topicTitle: 'Storage',
        correct: 8,
        total: 20,
        accuracy: 0.4,
      },
      {
        topicId: IDENTITY_ID,
        topicSlug: 'identity',
        topicTitle: 'Identity',
        correct: 28,
        total: 30,
        accuracy: 0.9333,
      },
    ],
    recentSessions: [
      {
        sessionId: SESSION_ID,
        startedAt: '2026-04-10T12:00:00.000Z',
        completedAt: '2026-04-10T12:20:00.000Z',
        status: 'completed',
        length: 25,
        score: {
          correct: 18,
          total: 25,
          perTopic: {},
        },
      },
    ],
    ...overrides,
  };
}

describe('ProgressView', () => {
  it('shows a spinner when loading', () => {
    const { getByLabelText } = render(<ProgressView state={{ status: 'loading' }} />);
    expect(getByLabelText('Loading progress')).toBeTruthy();
  });

  it('shows the error message on error', () => {
    const { getByText } = render(<ProgressView state={{ status: 'error', message: 'whoops' }} />);
    expect(getByText('whoops')).toBeTruthy();
  });

  it('renders overall accuracy, per-topic cards, and recent sessions', () => {
    const { getByText, getByTestId } = render(
      <ProgressView state={{ status: 'success', progress: makeProgress() }} />,
    );

    expect(getByText('36 / 50')).toBeTruthy();
    expect(getByText('72%')).toBeTruthy();
    expect(getByTestId('topic-storage')).toBeTruthy();
    expect(getByTestId('topic-identity')).toBeTruthy();
    expect(getByText('40%')).toBeTruthy();
    expect(getByText('93%')).toBeTruthy();
    expect(getByTestId(`session-${SESSION_ID}`)).toBeTruthy();
    expect(getByText(/25 questions · 18\/25 \(72%\)/)).toBeTruthy();
  });

  it('shows an empty state when no attempts exist', () => {
    const { getByText } = render(
      <ProgressView
        state={{
          status: 'success',
          progress: makeProgress({
            totalAttempts: 0,
            totalCorrect: 0,
            overallAccuracy: 0,
            perTopic: [],
            recentSessions: [],
          }),
        }}
      />,
    );

    expect(getByText('No attempts yet. Take a quiz to populate this section.')).toBeTruthy();
    expect(getByText('No sessions yet.')).toBeTruthy();
  });
});
