import type { Certification } from '@acpt/shared';
import { Link } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';

import { Badge } from '../../components/Badge';
import { BodyText } from '../../components/BodyText';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Row } from '../../components/Row';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';

export type CertificationListViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: readonly Certification[] };

export interface CertificationListViewProps {
  state: CertificationListViewState;
}

export function CertificationListView({ state }: CertificationListViewProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: theme.colors.background,
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingVertical: theme.spacing.xxxl,
      }}
      testID="cert-list-screen"
    >
      <Stack gap="xxl" style={{ maxWidth: 960, width: '100%', alignSelf: 'center' }}>
        <Stack gap="sm">
          <Badge label="Certification Library" tone="info" />
          <Heading level={1}>Choose a certification</Heading>
          <BodyText variant="muted">
            Pick a track to study. Wiki articles, practice quizzes, and your progress dashboard live
            inside each certification.
          </BodyText>
        </Stack>

        {state.status === 'loading' ? <Spinner label="Loading certifications" /> : null}

        {state.status === 'error' ? (
          <Card elevated>
            <Stack gap="xs">
              <Heading level={3}>Couldn&apos;t load certifications</Heading>
              <BodyText variant="muted">{state.message}</BodyText>
            </Stack>
          </Card>
        ) : null}

        {state.status === 'success' && state.items.length === 0 ? (
          <Card elevated>
            <BodyText variant="muted">
              No certifications found. Run <BodyText>pnpm seed</BodyText> to populate content.
            </BodyText>
          </Card>
        ) : null}

        {state.status === 'success' && state.items.length > 0 ? (
          <Stack gap="lg">
            {state.items.map((cert) => (
              <Link key={cert.id} href={`/cert/${cert.id}`} asChild>
                <Pressable testID={`cert-card-${cert.code}`}>
                  <Card padding="xl" radius="xl" elevated>
                    <Stack gap="md">
                      <Row justify="space-between" align="flex-start">
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Badge label="Certification Track" tone="info" />
                          <Heading level={2}>{cert.title}</Heading>
                        </Stack>
                        <Badge label={cert.code} tone="success" />
                      </Row>
                      <BodyText variant="muted">{cert.description}</BodyText>
                    </Stack>
                  </Card>
                </Pressable>
              </Link>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </ScrollView>
  );
}
