import { render } from '@testing-library/react-native';

import { flattenStyle } from '../../test-utils/flatten-style';
import { tokens } from '../../theme/tokens';
import { Heading } from '../Heading';

describe('Heading', () => {
  it('renders the children as a header with the level-1 font size by default', () => {
    const { getByText } = render(<Heading>Certifications</Heading>);
    const node = getByText('Certifications');

    expect(node.props.accessibilityRole).toBe('header');
    const style = flattenStyle(node.props.style);
    expect(style['fontSize']).toBe(tokens.fontSize.xxxl);
    expect(style['fontWeight']).toBe(tokens.fontWeight.semibold);
  });

  it('scales font size down for lower levels', () => {
    const { getByText } = render(<Heading level={3}>Sub</Heading>);
    const style = flattenStyle(getByText('Sub').props.style);

    expect(style['fontSize']).toBe(tokens.fontSize.xl);
  });
});
