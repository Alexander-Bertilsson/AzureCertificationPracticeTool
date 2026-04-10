import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('invokes onPress when pressed', () => {
    const handlePress = jest.fn();

    const { getByRole } = render(<Button label="Start quiz" onPress={handlePress} />);
    fireEvent.press(getByRole('button', { name: 'Start quiz' }));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onPress when disabled', () => {
    const handlePress = jest.fn();

    const { getByRole } = render(<Button label="Start" onPress={handlePress} disabled />);
    fireEvent.press(getByRole('button', { name: 'Start' }));

    expect(handlePress).not.toHaveBeenCalled();
  });

  it('exposes the accessibilityLabel override', () => {
    const { getByRole } = render(<Button label="Go" accessibilityLabel="Start quiz" />);

    expect(getByRole('button', { name: 'Start quiz' })).toBeTruthy();
  });
});
