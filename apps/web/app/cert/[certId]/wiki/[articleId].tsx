import type { WikiArticleId } from '@acpt/shared';
import { useLocalSearchParams } from 'expo-router';

import { useWikiArticle } from '../../../../src/api/hooks/use-wiki-article';
import {
  WikiArticleView,
  type WikiArticleViewState,
} from '../../../../src/features/wiki/WikiArticleView';

export default function WikiArticleScreen(): React.JSX.Element {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const brandedArticleId = articleId as WikiArticleId;

  const query = useWikiArticle(brandedArticleId);

  const state: WikiArticleViewState = query.isPending
    ? { status: 'loading' }
    : query.isError
      ? { status: 'error', message: query.error.message }
      : { status: 'success', article: query.data };

  return <WikiArticleView state={state} />;
}
