import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, useTheme } from '../theme-context';
import { tokens } from '../tokens';

function ThemeProbe(): React.JSX.Element {
  const theme = useTheme();
  return <Text>{`${theme.colors.primary}|${String(theme.spacing.md)}`}</Text>;
}

describe('ThemeProvider / useTheme', () => {
  it('exposes the token palette through useTheme', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(getByText(`${tokens.colors.primary}|${String(tokens.spacing.md)}`)).toBeTruthy();
  });

  it('falls back to the default token set when no provider is mounted', () => {
    const { getByText } = render(<ThemeProbe />);

    expect(getByText(`${tokens.colors.primary}|${String(tokens.spacing.md)}`)).toBeTruthy();
  });
});
