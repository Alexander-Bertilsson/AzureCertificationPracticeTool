import {
  WikiArticleResponseSchema,
  type WikiArticleId,
  type WikiArticleResponse,
} from '@acpt/shared';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { api } from '../client';

export function wikiArticleQueryKey(articleId: WikiArticleId): readonly unknown[] {
  return ['wiki', articleId] as const;
}

export function useWikiArticle(articleId: WikiArticleId): UseQueryResult<WikiArticleResponse> {
  return useQuery({
    queryKey: wikiArticleQueryKey(articleId),
    queryFn: async () => {
      const raw = await api.get<unknown>(`/wiki/${articleId}`);
      return WikiArticleResponseSchema.parse(raw);
    },
  });
}
