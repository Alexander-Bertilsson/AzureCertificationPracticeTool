import type { Certification, Topic } from '@acpt/shared';
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
  title: string;
  description: string;
  testID: string;
}

function NavCard({ href, title, description, testID }: NavCardProps): React.JSX.Element {
  return (
    <Link href={href} asChild>
      <Pressable testID={testID}>
        <Card padding="md">
          <Stack gap="xs">
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
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
      testID="cert-home-screen"
    >
      {state.status === 'loading' ? <Spinner label="Loading certification" /> : null}

      {state.status === 'error' ? (
        <Card>
          <Stack gap="xs">
            <Heading level={3}>Couldn&apos;t load this certification</Heading>
            <BodyText variant="muted">{state.message}</BodyText>
          </Stack>
        </Card>
      ) : null}

      {state.status === 'success' ? (
        <Stack gap="xl">
          <Stack gap="sm">
            <Row gap="sm" align="center">
              <Badge label={state.certification.code} tone="info" />
            </Row>
            <Heading level={1}>{state.certification.title}</Heading>
            <BodyText variant="muted">{state.certification.description}</BodyText>
          </Stack>

          <Stack gap="md">
            <Heading level={2}>Study</Heading>
            <NavCard
              href={`/cert/${state.certification.id}/wiki`}
              title="Wiki"
              description="Bite-sized articles per topic."
              testID="nav-wiki"
            />
            <NavCard
              href={`/cert/${state.certification.id}/quiz`}
              title="Quiz"
              description="25- or 50-question multiple choice, practice or exam mode."
              testID="nav-quiz"
            />
            <NavCard
              href={`/cert/${state.certification.id}/progress`}
              title="Progress"
              description="Overall accuracy and your weakest topics."
              testID="nav-progress"
            />
          </Stack>

          <Stack gap="md">
            <Heading level={2}>Topics</Heading>
            {state.topics.length === 0 ? (
              <Card>
                <BodyText variant="muted">No topics yet for this certification.</BodyText>
              </Card>
            ) : (
              <Stack gap="sm">
                {state.topics.map((topic) => (
                  <Card key={topic.id} padding="md">
                    <Stack gap="xs">
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
    </ScrollView>
  );
}
