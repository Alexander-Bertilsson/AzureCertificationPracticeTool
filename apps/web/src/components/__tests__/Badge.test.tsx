import { render } from '@testing-library/react-native';

import { flattenStyle } from '../../test-utils/flatten-style';
import { tokens } from '../../theme/tokens';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders the label', () => {
    const { getByText } = render(<Badge label="Identity" />);
    expect(getByText('Identity')).toBeTruthy();
  });

  it('applies the danger tone colors', () => {
    const { getByText, getByTestId } = render(
      <Badge label="Failed" tone="danger" testID="badge" />,
    );

    const containerStyle = flattenStyle(getByTestId('badge').props.style);
    const textStyle = flattenStyle(getByText('Failed').props.style);
    expect(containerStyle['borderRadius']).toBe(tokens.radius.pill);
    expect(textStyle['color']).toBe(tokens.colors.danger);
  });
});
