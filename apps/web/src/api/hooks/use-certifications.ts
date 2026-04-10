import { CertificationListResponseSchema, type CertificationListResponse } from '@acpt/shared';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { api } from '../client';

export const CERTIFICATIONS_QUERY_KEY = ['certifications'] as const;

export function useCertifications(): UseQueryResult<CertificationListResponse> {
  return useQuery({
    queryKey: CERTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const raw = await api.get<unknown>('/certifications');
      return CertificationListResponseSchema.parse(raw);
    },
  });
}
