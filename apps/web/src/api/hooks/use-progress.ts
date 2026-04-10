import { ProgressResponseSchema, type CertificationId, type ProgressResponse } from '@acpt/shared';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { api } from '../client';

export function progressQueryKey(certId: CertificationId): readonly unknown[] {
  return ['progress', certId] as const;
}

export function useProgress(certId: CertificationId): UseQueryResult<ProgressResponse> {
  return useQuery({
    queryKey: progressQueryKey(certId),
    queryFn: async () => {
      const raw = await api.get<unknown>(`/progress/${certId}`);
      return ProgressResponseSchema.parse(raw);
    },
  });
}
