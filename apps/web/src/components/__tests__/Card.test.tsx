import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { flattenStyle } from '../../test-utils/flatten-style';
import { tokens } from '../../theme/tokens';
import { Card } from '../Card';

describe('Card', () => {
  it('renders a themed container around its children', () => {
    const { getByTestId, getByText } = render(
      <Card testID="card">
        <Text>content</Text>
      </Card>,
    );

    expect(getByText('content')).toBeTruthy();
    const style = flattenStyle(getByTestId('card').props.style);
    expect(style['backgroundColor']).toBe(tokens.colors.surface);
    expect(style['borderRadius']).toBe(tokens.radius.lg);
    expect(style['padding']).toBe(tokens.spacing.lg);
  });

  it('honors a custom padding token', () => {
    const { getByTestId } = render(
      <Card testID="card" padding="sm">
        <Text>x</Text>
      </Card>,
    );

    const style = flattenStyle(getByTestId('card').props.style);
    expect(style['padding']).toBe(tokens.spacing.sm);
  });
});
