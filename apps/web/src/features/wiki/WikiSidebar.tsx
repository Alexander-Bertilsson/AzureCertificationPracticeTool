import type { CertificationId, Topic, TopicId } from '@acpt/shared';
import { Link } from 'expo-router';
import { Pressable, View, type ViewStyle } from 'react-native';

import { BodyText } from '../../components/BodyText';
import { Spinner } from '../../components/Spinner';
import { Stack } from '../../components/Stack';
import { useTheme } from '../../theme/theme-context';
import type { Tokens } from '../../theme/tokens';

export interface WikiSidebarProps {
  certificationId: CertificationId;
  topics: readonly Topic[];
  isLoadingTopics: boolean;
  activeTopicId: TopicId | null;
}

function itemStyle(theme: Tokens, isActive: boolean): ViewStyle {
  return {
    borderRadius: theme.radius.lg,
    backgroundColor: isActive ? theme.colors.surface : 'transparent',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    ...(isActive ? theme.shadow.ambient : {}),
  };
}

interface SidebarItemProps {
  href: string;
  label: string;
  isActive: boolean;
  testID: string;
}

function SidebarItem({ href, label, isActive, testID }: SidebarItemProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <Link href={href} asChild>
      <Pressable style={itemStyle(theme, isActive)} testID={testID}>
        <BodyText
          style={{
            color: isActive ? theme.colors.primary : theme.colors.textMuted,
            fontWeight: isActive ? theme.fontWeight.bold : theme.fontWeight.medium,
          }}
        >
          {label}
        </BodyText>
      </Pressable>
    </Link>
  );
}

export function WikiSidebar({
  certificationId,
  topics,
  isLoadingTopics,
  activeTopicId,
}: WikiSidebarProps): React.JSX.Element {
  const theme = useTheme();
  const sorted = [...topics].sort((a, b) => a.order - b.order);

  return (
    <View
      testID="wiki-sidebar"
      style={{
        width: 260,
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
      }}
    >
      <Stack gap="lg">
        <BodyText
          variant="small"
          style={{
            color: theme.colors.textMuted,
            fontWeight: theme.fontWeight.bold,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}
        >
          Categories
        </BodyText>

        {isLoadingTopics ? (
          <Spinner label="Loading topics" />
        ) : (
          <Stack gap="xs">
            <SidebarItem
              href={`/cert/${certificationId}/wiki`}
              label="All topics"
              isActive={activeTopicId === null}
              testID="sidebar-all-topics"
            />
            {sorted.map((topic) => (
              <SidebarItem
                key={topic.id}
                href={`/cert/${certificationId}/wiki?topicId=${topic.id}`}
                label={topic.title}
                isActive={activeTopicId === topic.id}
                testID={`sidebar-topic-${topic.slug}`}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </View>
  );
}
