import { render } from '@testing-library/react-native';

import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('renders with a default accessibility label', () => {
    const { getByLabelText } = render(<Spinner testID="spinner" />);
    expect(getByLabelText('Loading')).toBeTruthy();
  });

  it('accepts a custom label', () => {
    const { getByLabelText } = render(<Spinner label="Fetching progress" />);
    expect(getByLabelText('Fetching progress')).toBeTruthy();
  });
});
