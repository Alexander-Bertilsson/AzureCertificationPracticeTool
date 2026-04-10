import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { flattenStyle } from '../../test-utils/flatten-style';
import { Stack } from '../Stack';

describe('Stack', () => {
  it('renders children in a column with the given gap token', () => {
    const { getByTestId } = render(
      <Stack gap="lg" padding="md" testID="stack">
        <Text>one</Text>
        <Text>two</Text>
      </Stack>,
    );

    const node = getByTestId('stack');
    const style = flattenStyle(node.props.style);

    expect(style['flexDirection']).toBe('column');
    expect(style['gap']).toBe(16);
    expect(style['padding']).toBe(12);
  });

  it('renders its children', () => {
    const { getByText } = render(
      <Stack>
        <Text>child</Text>
        <View accessibilityLabel="wrap" />
      </Stack>,
    );

    expect(getByText('child')).toBeTruthy();
  });
});
