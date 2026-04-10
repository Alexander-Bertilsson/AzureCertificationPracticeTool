import type { Certification, CertificationId, Topic, TopicId } from '@acpt/shared';
import { render } from '@testing-library/react-native';

import { CertificationHomeView } from '../CertificationHomeView';

const CERT_ID = '507f1f77bcf86cd799439011' as CertificationId;

function makeCert(): Certification {
  return {
    id: CERT_ID,
    code: 'AZ-104',
    slug: 'az-104',
    title: 'Azure Administrator Associate',
    description: 'Manage Azure identities, resources, and compute.',
    mslearnPathUrl: 'https://learn.microsoft.com/en-us/certifications/azure-administrator/',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: '507f1f77bcf86cd799439021' as TopicId,
    certificationId: CERT_ID,
    slug: 'identity',
    title: 'Manage Azure identities and governance',
    order: 0,
    description: 'Entra ID, RBAC, and subscription governance.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('CertificationHomeView', () => {
  it('shows a spinner when loading', () => {
    const { getByLabelText } = render(<CertificationHomeView state={{ status: 'loading' }} />);
    expect(getByLabelText('Loading certification')).toBeTruthy();
  });

  it('shows an error message on error', () => {
    const { getByText } = render(
      <CertificationHomeView state={{ status: 'error', message: 'boom' }} />,
    );
    expect(getByText('boom')).toBeTruthy();
  });

  it('renders certification metadata + nav cards + topics on success', () => {
    const { getByText, getByTestId } = render(
      <CertificationHomeView
        state={{
          status: 'success',
          certification: makeCert(),
          topics: [
            makeTopic(),
            makeTopic({
              id: '507f1f77bcf86cd799439022' as TopicId,
              slug: 'storage',
              title: 'Implement and manage storage',
              order: 1,
              description: 'Storage accounts, blob, files.',
            }),
          ],
        }}
      />,
    );

    expect(getByText('Azure Administrator Associate')).toBeTruthy();
    expect(getByText('AZ-104')).toBeTruthy();
    expect(getByTestId('nav-wiki')).toBeTruthy();
    expect(getByTestId('nav-quiz')).toBeTruthy();
    expect(getByTestId('nav-progress')).toBeTruthy();
    expect(getByText('Manage Azure identities and governance')).toBeTruthy();
    expect(getByText('Implement and manage storage')).toBeTruthy();
  });

  it('shows an empty topic message when there are no topics', () => {
    const { getByText } = render(
      <CertificationHomeView
        state={{ status: 'success', certification: makeCert(), topics: [] }}
      />,
    );
    expect(getByText('No topics yet for this certification.')).toBeTruthy();
  });
});
