import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { flattenStyle } from '../../test-utils/flatten-style';
import { Row } from '../Row';

describe('Row', () => {
  it('renders children in a row with gap and wrap applied', () => {
    const { getByTestId } = render(
      <Row gap="sm" wrap testID="row">
        <Text>a</Text>
        <Text>b</Text>
      </Row>,
    );

    const node = getByTestId('row');
    const style = flattenStyle(node.props.style);

    expect(style['flexDirection']).toBe('row');
    expect(style['gap']).toBe(8);
    expect(style['flexWrap']).toBe('wrap');
    expect(style['alignItems']).toBe('center');
  });
});
