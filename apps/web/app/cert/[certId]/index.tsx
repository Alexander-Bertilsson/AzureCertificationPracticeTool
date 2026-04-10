import type { CertificationId } from '@acpt/shared';
import { useLocalSearchParams } from 'expo-router';

import { useCertification } from '../../../src/api/hooks/use-certification';
import { useTopics } from '../../../src/api/hooks/use-topics';
import {
  CertificationHomeView,
  type CertificationHomeViewState,
} from '../../../src/features/certifications/CertificationHomeView';

export default function CertHomeScreen(): React.JSX.Element {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const brandedCertId = certId as CertificationId;

  const certQuery = useCertification(brandedCertId);
  const topicsQuery = useTopics(brandedCertId);

  const state: CertificationHomeViewState =
    certQuery.isPending || topicsQuery.isPending
      ? { status: 'loading' }
      : certQuery.isError
        ? { status: 'error', message: certQuery.error.message }
        : topicsQuery.isError
          ? { status: 'error', message: topicsQuery.error.message }
          : {
              status: 'success',
              certification: certQuery.data,
              topics: topicsQuery.data.items,
            };

  return <CertificationHomeView state={state} />;
}
