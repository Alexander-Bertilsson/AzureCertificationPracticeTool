import type { CertificationId } from '@acpt/shared';
import { useLocalSearchParams } from 'expo-router';

import { useTopics } from '../../../../src/api/hooks/use-topics';
import { useWikiArticles } from '../../../../src/api/hooks/use-wiki-articles';
import { WikiListView, type WikiListViewState } from '../../../../src/features/wiki/WikiListView';

export default function WikiListScreen(): React.JSX.Element {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const brandedCertId = certId as CertificationId;

  const topicsQuery = useTopics(brandedCertId);
  const articlesQuery = useWikiArticles(brandedCertId);

  const state: WikiListViewState =
    topicsQuery.isPending || articlesQuery.isPending
      ? { status: 'loading' }
      : topicsQuery.isError
        ? { status: 'error', message: topicsQuery.error.message }
        : articlesQuery.isError
          ? { status: 'error', message: articlesQuery.error.message }
          : {
              status: 'success',
              topics: topicsQuery.data.items,
              articles: articlesQuery.data.items,
            };

  return <WikiListView state={state} />;
}
