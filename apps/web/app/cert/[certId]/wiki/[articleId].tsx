import type { CertificationId, WikiArticleId } from '@acpt/shared';
import { useLocalSearchParams } from 'expo-router';

import { useTopics } from '../../../../src/api/hooks/use-topics';
import { useWikiArticle } from '../../../../src/api/hooks/use-wiki-article';
import {
  WikiArticleView,
  type WikiArticleViewState,
} from '../../../../src/features/wiki/WikiArticleView';
import { WikiShell } from '../../../../src/features/wiki/WikiShell';

export default function WikiArticleScreen(): React.JSX.Element {
  const { certId, articleId } = useLocalSearchParams<{
    certId: string;
    articleId: string;
  }>();
  const brandedCertId = certId as CertificationId;
  const brandedArticleId = articleId as WikiArticleId;

  const topicsQuery = useTopics(brandedCertId);
  const articleQuery = useWikiArticle(brandedArticleId);

  const state: WikiArticleViewState = articleQuery.isPending
    ? { status: 'loading' }
    : articleQuery.isError
      ? { status: 'error', message: articleQuery.error.message }
      : { status: 'success', article: articleQuery.data };

  return (
    <WikiShell
      certificationId={brandedCertId}
      topics={topicsQuery.data?.items ?? []}
      isLoadingTopics={topicsQuery.isPending}
      activeTopicId={articleQuery.data?.topicId ?? null}
    >
      <WikiArticleView state={state} />
    </WikiShell>
  );
}
