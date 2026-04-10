import type { Certification, Topic } from '@acpt/shared';
import { Link } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Badge } from '../../components/Badge';
import { BodyText } from '../../components/BodyText';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Row } from '../../components/Row';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';
import type { Tokens } from '../../theme/tokens';

export type CertificationHomeViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'success';
      certification: Certification;
      topics: readonly Topic[];
    };

export interface CertificationHomeViewProps {
  state: CertificationHomeViewState;
}

interface NavCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  testID: string;
  theme: Tokens;
}

function NavCard({
  href,
  eyebrow,
  title,
  description,
  testID,
  theme,
}: NavCardProps): React.JSX.Element {
  return (
    <Link href={href} asChild>
      <Pressable testID={testID} style={{ flex: 1, minWidth: 220 }}>
        <Card padding="xl" radius="xl" elevated>
          <Stack gap="sm">
            <BodyText
              variant="small"
              style={{
                color: theme.colors.primary,
                fontWeight: theme.fontWeight.bold,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </BodyText>
            <Heading level={3}>{title}</Heading>
            <BodyText variant="muted">{description}</BodyText>
          </Stack>
        </Card>
      </Pressable>
    </Link>
  );
}

export function CertificationHomeView({ state }: CertificationHomeViewProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: theme.colors.background,
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingVertical: theme.spacing.xxxl,
      }}
      testID="cert-home-screen"
    >
      <View style={{ maxWidth: 1100, width: '100%', alignSelf: 'center' }}>
        {state.status === 'loading' ? <Spinner label="Loading certification" /> : null}

        {state.status === 'error' ? (
          <Card elevated>
            <Stack gap="xs">
              <Heading level={3}>Couldn&apos;t load this certification</Heading>
              <BodyText variant="muted">{state.message}</BodyText>
            </Stack>
          </Card>
        ) : null}

        {state.status === 'success' ? (
          <Stack gap="xxl">
            <Card padding="xl" radius="xxl" elevated>
              <Stack gap="md">
                <Badge label={state.certification.code} tone="info" />
                <Heading level={1}>{state.certification.title}</Heading>
                <BodyText variant="muted">{state.certification.description}</BodyText>
              </Stack>
            </Card>

            <Stack gap="lg">
              <Heading level={2}>Study tools</Heading>
              <Row gap="lg" wrap align="stretch">
                <NavCard
                  href={`/cert/${state.certification.id}/wiki`}
                  eyebrow="Learn"
                  title="Wiki"
                  description="Bite-sized articles per topic."
                  testID="nav-wiki"
                  theme={theme}
                />
                <NavCard
                  href={`/cert/${state.certification.id}/quiz`}
                  eyebrow="Practice"
                  title="Quiz"
                  description="25 or 50 questions, practice or exam mode."
                  testID="nav-quiz"
                  theme={theme}
                />
                <NavCard
                  href={`/cert/${state.certification.id}/progress`}
                  eyebrow="Analyze"
                  title="Progress"
                  description="Overall accuracy and your weakest topics."
                  testID="nav-progress"
                  theme={theme}
                />
              </Row>
            </Stack>

            <Stack gap="lg">
              <Heading level={2}>Topics</Heading>
              {state.topics.length === 0 ? (
                <Card elevated>
                  <BodyText variant="muted">No topics yet for this certification.</BodyText>
                </Card>
              ) : (
                <Stack gap="md">
                  {state.topics.map((topic, index) => (
                    <Card key={topic.id} padding="xl" radius="xl" elevated>
                      <Stack gap="xs">
                        <BodyText
                          variant="small"
                          style={{
                            color: theme.colors.tertiary,
                            fontWeight: theme.fontWeight.bold,
                            letterSpacing: 0.6,
                            textTransform: 'uppercase',
                          }}
                        >
                          {`Topic ${String(index + 1).padStart(2, '0')}`}
                        </BodyText>
                        <Heading level={3}>{topic.title}</Heading>
                        <BodyText variant="muted">{topic.description}</BodyText>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        ) : null}
      </View>
    </ScrollView>
  );
}
