import { render } from '@testing-library/react-native';

import { flattenStyle } from '../../test-utils/flatten-style';
import { tokens } from '../../theme/tokens';
import { BodyText } from '../BodyText';

describe('BodyText', () => {
  it('uses the default color and font size', () => {
    const { getByText } = render(<BodyText>hello</BodyText>);
    const style = flattenStyle(getByText('hello').props.style);

    expect(style['color']).toBe(tokens.colors.text);
    expect(style['fontSize']).toBe(tokens.fontSize.md);
  });

  it('applies the muted variant', () => {
    const { getByText } = render(<BodyText variant="muted">note</BodyText>);
    const style = flattenStyle(getByText('note').props.style);

    expect(style['color']).toBe(tokens.colors.textMuted);
  });

  it('applies the small variant', () => {
    const { getByText } = render(<BodyText variant="small">tiny</BodyText>);
    const style = flattenStyle(getByText('tiny').props.style);

    expect(style['fontSize']).toBe(tokens.fontSize.sm);
  });
});
