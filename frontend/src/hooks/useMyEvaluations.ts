import { useQuery } from '@tanstack/react-query'

import { fetchMyEvaluations } from '../api/evaluations'
import { useAuth } from '../context/AuthContext'

export function useMyEvaluations() {
  const { token, isAuthenticated } = useAuth()

  const { data: evaluations = [], isLoading, error } = useQuery({
    queryKey: ['myEvaluations'],
    queryFn: () => fetchMyEvaluations(token!),
    enabled: isAuthenticated,
  })

  return { evaluations, isLoading, error }
}
