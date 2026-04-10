import type { CertificationId, Topic, TopicId } from '@acpt/shared';
import type { ReactNode } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import { useTheme } from '../../theme/theme-context';

import { WikiSidebar } from './WikiSidebar';

const SIDEBAR_BREAKPOINT = 900;

export interface WikiShellProps {
  certificationId: CertificationId;
  topics: readonly Topic[];
  isLoadingTopics: boolean;
  activeTopicId: TopicId | null;
  children: ReactNode;
}

export function WikiShell({
  certificationId,
  topics,
  isLoadingTopics,
  activeTopicId,
  children,
}: WikiShellProps): React.JSX.Element {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= SIDEBAR_BREAKPOINT;

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: theme.colors.background,
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingVertical: theme.spacing.xxxl,
      }}
      testID="wiki-shell"
    >
      <View
        style={{
          flexDirection: isWide ? 'row' : 'column',
          gap: theme.spacing.xl,
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center',
          alignItems: 'flex-start',
        }}
      >
        <WikiSidebar
          certificationId={certificationId}
          topics={topics}
          isLoadingTopics={isLoadingTopics}
          activeTopicId={activeTopicId}
        />
        <View style={{ flex: 1, width: '100%' }}>{children}</View>
      </View>
    </ScrollView>
  );
}
