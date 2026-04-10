import type { CertificationId, TopicId } from '@acpt/shared';
import { useLocalSearchParams } from 'expo-router';

import { useTopics } from '../../../../src/api/hooks/use-topics';
import { useWikiArticles } from '../../../../src/api/hooks/use-wiki-articles';
import { WikiListView, type WikiListViewState } from '../../../../src/features/wiki/WikiListView';
import { WikiShell } from '../../../../src/features/wiki/WikiShell';

export default function WikiListScreen(): React.JSX.Element {
  const { certId, topicId: topicIdParam } = useLocalSearchParams<{
    certId: string;
    topicId?: string;
  }>();
  const brandedCertId = certId as CertificationId;
  const activeTopicId: TopicId | null =
    topicIdParam !== undefined && topicIdParam.length > 0 ? (topicIdParam as TopicId) : null;

  const topicsQuery = useTopics(brandedCertId);
  const articlesQuery = useWikiArticles(brandedCertId, activeTopicId ?? undefined);

  const topicsForView =
    topicsQuery.data !== undefined && activeTopicId !== null
      ? topicsQuery.data.items.filter((t) => t.id === activeTopicId)
      : (topicsQuery.data?.items ?? []);

  const state: WikiListViewState =
    topicsQuery.isPending || articlesQuery.isPending
      ? { status: 'loading' }
      : topicsQuery.isError
        ? { status: 'error', message: topicsQuery.error.message }
        : articlesQuery.isError
          ? { status: 'error', message: articlesQuery.error.message }
          : {
              status: 'success',
              topics: topicsForView,
              articles: articlesQuery.data.items,
              activeTopicId,
            };

  return (
    <WikiShell
      certificationId={brandedCertId}
      topics={topicsQuery.data?.items ?? []}
      isLoadingTopics={topicsQuery.isPending}
      activeTopicId={activeTopicId}
    >
      <WikiListView state={state} />
    </WikiShell>
  );
}
