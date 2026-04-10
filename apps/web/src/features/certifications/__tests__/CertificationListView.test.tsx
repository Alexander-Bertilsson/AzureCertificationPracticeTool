import type { Certification, CertificationId } from '@acpt/shared';
import { render } from '@testing-library/react-native';

import { CertificationListView } from '../CertificationListView';

function makeCert(overrides: Partial<Certification> = {}): Certification {
  return {
    id: '507f1f77bcf86cd799439011' as CertificationId,
    code: 'AZ-104',
    slug: 'az-104',
    title: 'Azure Administrator Associate',
    description: 'Manage Azure identities, resources, and compute.',
    mslearnPathUrl: 'https://learn.microsoft.com/en-us/certifications/azure-administrator/',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('CertificationListView', () => {
  it('shows a spinner when loading', () => {
    const { getByLabelText } = render(<CertificationListView state={{ status: 'loading' }} />);
    expect(getByLabelText('Loading certifications')).toBeTruthy();
  });

  it('shows the error message on error', () => {
    const { getByText } = render(
      <CertificationListView
        state={{ status: 'error', message: 'fetch failed: api unreachable' }}
      />,
    );
    expect(getByText('fetch failed: api unreachable')).toBeTruthy();
  });

  it('shows an empty state when the list is empty', () => {
    const { getByText } = render(
      <CertificationListView state={{ status: 'success', items: [] }} />,
    );
    expect(getByText(/No certifications found/)).toBeTruthy();
  });

  it('renders a card per certification with its code and title', () => {
    const { getByText, getByTestId } = render(
      <CertificationListView
        state={{
          status: 'success',
          items: [
            makeCert(),
            makeCert({
              id: '507f1f77bcf86cd799439012' as CertificationId,
              code: 'AZ-204',
              title: 'Azure Developer',
            }),
          ],
        }}
      />,
    );

    expect(getByText('Azure Administrator Associate')).toBeTruthy();
    expect(getByText('Azure Developer')).toBeTruthy();
    expect(getByTestId('cert-card-AZ-104')).toBeTruthy();
    expect(getByTestId('cert-card-AZ-204')).toBeTruthy();
  });
});
