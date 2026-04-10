import type { CertificationId, CreateQuizSessionRequest } from '@acpt/shared';
import { router, useLocalSearchParams } from 'expo-router';

import { useCreateQuizSession } from '../../../../src/api/hooks/use-create-quiz-session';
import { useTopics } from '../../../../src/api/hooks/use-topics';
import { QuizConfigView } from '../../../../src/features/quiz/QuizConfigView';

export default function QuizConfigScreen(): React.JSX.Element {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const brandedCertId = certId as CertificationId;

  const topicsQuery = useTopics(brandedCertId);
  const createMutation = useCreateQuizSession();

  const handleStart = (config: CreateQuizSessionRequest): void => {
    createMutation.mutate(config, {
      onSuccess: (response) => {
        router.push(`/cert/${brandedCertId}/quiz/${response.session.id}`);
      },
    });
  };

  const errorMessage = createMutation.error?.message;

  return (
    <QuizConfigView
      certificationId={brandedCertId}
      topics={topicsQuery.data?.items ?? []}
      isTopicsLoading={topicsQuery.isPending}
      isSubmitting={createMutation.isPending}
      onStart={handleStart}
      {...(errorMessage !== undefined ? { errorMessage } : {})}
    />
  );
}
