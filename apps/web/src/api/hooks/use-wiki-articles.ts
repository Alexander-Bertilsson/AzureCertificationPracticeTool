import {
  WikiArticleListResponseSchema,
  type CertificationId,
  type TopicId,
  type WikiArticleListResponse,
} from '@acpt/shared';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { api } from '../client';

export function wikiArticlesQueryKey(
  certId: CertificationId,
  topicId?: TopicId,
): readonly unknown[] {
  return ['certifications', certId, 'wiki', { topicId: topicId ?? null }] as const;
}

export function useWikiArticles(
  certId: CertificationId,
  topicId?: TopicId,
): UseQueryResult<WikiArticleListResponse> {
  return useQuery({
    queryKey: wikiArticlesQueryKey(certId, topicId),
    queryFn: async () => {
      const path =
        topicId !== undefined
          ? `/certifications/${certId}/wiki?topicId=${topicId}`
          : `/certifications/${certId}/wiki`;
      const raw = await api.get<unknown>(path);
      return WikiArticleListResponseSchema.parse(raw);
    },
  });
}
