import {
  TopicListResponseSchema,
  type CertificationId,
  type TopicListResponse,
} from '@acpt/shared';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { api } from '../client';

export function topicsQueryKey(certId: CertificationId): readonly unknown[] {
  return ['certifications', certId, 'topics'] as const;
}

export function useTopics(certId: CertificationId): UseQueryResult<TopicListResponse> {
  return useQuery({
    queryKey: topicsQueryKey(certId),
    queryFn: async () => {
      const raw = await api.get<unknown>(`/certifications/${certId}/topics`);
      return TopicListResponseSchema.parse(raw);
    },
  });
}
