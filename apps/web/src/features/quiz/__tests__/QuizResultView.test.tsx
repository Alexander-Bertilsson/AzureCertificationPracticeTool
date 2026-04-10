import type { CertificationId, QuizSession, QuizSessionId, Topic, TopicId } from '@acpt/shared';
import { render } from '@testing-library/react-native';

import { QuizResultView } from '../QuizResultView';

const CERT_ID = '507f1f77bcf86cd799439011' as CertificationId;
const IDENTITY_ID = '507f1f77bcf86cd799439021' as TopicId;
const STORAGE_ID = '507f1f77bcf86cd799439022' as TopicId;

function makeTopic(id: TopicId, title: string, order: number): Topic {
  return {
    id,
    certificationId: CERT_ID,
    slug: title.toLowerCase(),
    title,
    order,
    description: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeCompletedSession(): QuizSession {
  return {
    id: '507f1f77bcf86cd799439051' as QuizSessionId,
    userId: 'hardcoded-user',
    certificationId: CERT_ID,
    mode: 'mixed',
    feedbackMode: 'practice',
    length: 25,
    questionIds: [],
    status: 'completed',
    startedAt: '2026-04-10T12:00:00.000Z',
    completedAt: '2026-04-10T12:20:00.000Z',
    score: {
      correct: 18,
      total: 25,
      perTopic: {
        [IDENTITY_ID]: { correct: 10, total: 12 },
        [STORAGE_ID]: { correct: 8, total: 13 },
      },
    },
    createdAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-04-10T12:20:00.000Z',
  };
}

describe('QuizResultView', () => {
  it('shows loading / error states', () => {
    const { getByLabelText, rerender, getByText } = render(
      <QuizResultView state={{ status: 'loading' }} />,
    );
    expect(getByLabelText('Finishing quiz')).toBeTruthy();

    rerender(<QuizResultView state={{ status: 'error', message: 'nope' }} />);
    expect(getByText('nope')).toBeTruthy();
  });

  it('shows overall and per-topic scores on success', () => {
    const { getByText } = render(
      <QuizResultView
        state={{
          status: 'success',
          session: makeCompletedSession(),
          topics: [makeTopic(IDENTITY_ID, 'Identity', 0), makeTopic(STORAGE_ID, 'Storage', 1)],
        }}
      />,
    );

    expect(getByText('18 / 25')).toBeTruthy();
    expect(getByText('72%')).toBeTruthy();
    expect(getByText('Identity')).toBeTruthy();
    expect(getByText('Storage')).toBeTruthy();
    expect(getByText('10 of 12 correct')).toBeTruthy();
    expect(getByText('8 of 13 correct')).toBeTruthy();
  });
});
