import {
  CertificationDetailResponseSchema,
  type CertificationDetailResponse,
  type CertificationId,
} from '@acpt/shared';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { api } from '../client';

export function certificationQueryKey(certId: CertificationId): readonly unknown[] {
  return ['certifications', certId] as const;
}

export function useCertification(
  certId: CertificationId,
): UseQueryResult<CertificationDetailResponse> {
  return useQuery({
    queryKey: certificationQueryKey(certId),
    queryFn: async () => {
      const raw = await api.get<unknown>(`/certifications/${certId}`);
      return CertificationDetailResponseSchema.parse(raw);
    },
  });
}
