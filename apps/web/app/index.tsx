import { useCertifications } from '../src/api/hooks/use-certifications';
import {
  CertificationListView,
  type CertificationListViewState,
} from '../src/features/certifications/CertificationListView';

export default function HomeScreen(): React.JSX.Element {
  const query = useCertifications();

  const state: CertificationListViewState = query.isPending
    ? { status: 'loading' }
    : query.isError
      ? { status: 'error', message: query.error.message }
      : { status: 'success', items: query.data.items };

  return <CertificationListView state={state} />;
}
