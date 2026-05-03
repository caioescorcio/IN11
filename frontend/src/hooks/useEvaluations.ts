import { useQuery } from '@tanstack/react-query'

import { fetchEvaluationStats, fetchEvaluations } from '../api/evaluations'

export function useEvaluations(movieId: string | undefined) {
  const {
    data: evaluations = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['evaluations', movieId],
    queryFn: () => fetchEvaluations(movieId!),
    enabled: !!movieId,
  })

  const { data: stats } = useQuery({
    queryKey: ['evalStats', movieId],
    queryFn: () => fetchEvaluationStats(movieId!),
    enabled: !!movieId,
  })

  return { evaluations, stats, isLoading, refetch }
}
