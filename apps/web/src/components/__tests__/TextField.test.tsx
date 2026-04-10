import { fireEvent, render } from '@testing-library/react-native';

import { TextField } from '../TextField';

describe('TextField', () => {
  it('reports changes via onChangeText', () => {
    const handleChange = jest.fn();

    const { getByLabelText } = render(
      <TextField label="Email" value="" onChangeText={handleChange} />,
    );
    fireEvent.changeText(getByLabelText('Email'), 'hello@example.com');

    expect(handleChange).toHaveBeenCalledWith('hello@example.com');
  });

  it('shows the error message when error is set', () => {
    const { getByText } = render(
      <TextField
        label="Email"
        value="bad"
        onChangeText={jest.fn()}
        error="Must be a valid email"
      />,
    );

    expect(getByText('Must be a valid email')).toBeTruthy();
  });

  it('shows helper text when no error is present', () => {
    const { getByText } = render(
      <TextField
        label="Email"
        value=""
        onChangeText={jest.fn()}
        helperText="We never share this"
      />,
    );

    expect(getByText('We never share this')).toBeTruthy();
  });
});
