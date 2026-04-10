import type { CertificationId } from '@acpt/shared';
import { useLocalSearchParams } from 'expo-router';

import { useProgress } from '../../../src/api/hooks/use-progress';
import { ProgressView, type ProgressViewState } from '../../../src/features/progress/ProgressView';

export default function ProgressScreen(): React.JSX.Element {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const brandedCertId = certId as CertificationId;

  const query = useProgress(brandedCertId);

  const state: ProgressViewState = query.isPending
    ? { status: 'loading' }
    : query.isError
      ? { status: 'error', message: query.error.message }
      : { status: 'success', progress: query.data };

  return <ProgressView state={state} />;
}
