import type { CertificationId, Topic, TopicId } from '@acpt/shared';
import { fireEvent, render } from '@testing-library/react-native';

import { QuizConfigView } from '../QuizConfigView';

const CERT_ID = '507f1f77bcf86cd799439011' as CertificationId;

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: '507f1f77bcf86cd799439021' as TopicId,
    certificationId: CERT_ID,
    slug: 'identity',
    title: 'Identity',
    order: 0,
    description: 'Entra ID and RBAC.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('QuizConfigView', () => {
  it('starts a mixed practice 25-question quiz with the defaults', () => {
    const onStart = jest.fn();

    const { getByTestId } = render(
      <QuizConfigView
        certificationId={CERT_ID}
        topics={[makeTopic()]}
        isTopicsLoading={false}
        isSubmitting={false}
        onStart={onStart}
      />,
    );

    fireEvent.press(getByTestId('start-quiz-button'));

    expect(onStart).toHaveBeenCalledWith({
      certificationId: CERT_ID,
      length: 25,
      mode: 'mixed',
      feedbackMode: 'practice',
    });
  });

  it('requires a topic to be picked in single-topic mode', () => {
    const onStart = jest.fn();

    const identity = makeTopic();
    const storage = makeTopic({
      id: '507f1f77bcf86cd799439022' as TopicId,
      slug: 'storage',
      title: 'Storage',
      order: 1,
      description: 'Storage accounts.',
    });

    const { getByTestId } = render(
      <QuizConfigView
        certificationId={CERT_ID}
        topics={[identity, storage]}
        isTopicsLoading={false}
        isSubmitting={false}
        onStart={onStart}
      />,
    );

    fireEvent.press(getByTestId('mode-single-topic'));
    fireEvent.press(getByTestId('length-50'));
    fireEvent.press(getByTestId('feedback-exam'));
    fireEvent.press(getByTestId('topic-storage'));
    fireEvent.press(getByTestId('start-quiz-button'));

    expect(onStart).toHaveBeenCalledWith({
      certificationId: CERT_ID,
      length: 50,
      mode: 'single-topic',
      feedbackMode: 'exam',
      topicId: storage.id,
    });
  });

  it('disables the start button while a topic has not been picked in single-topic mode', () => {
    const onStart = jest.fn();

    const { getByTestId } = render(
      <QuizConfigView
        certificationId={CERT_ID}
        topics={[makeTopic()]}
        isTopicsLoading={false}
        isSubmitting={false}
        onStart={onStart}
      />,
    );

    fireEvent.press(getByTestId('mode-single-topic'));
    fireEvent.press(getByTestId('start-quiz-button'));

    expect(onStart).not.toHaveBeenCalled();
  });
});
