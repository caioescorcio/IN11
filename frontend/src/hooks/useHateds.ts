import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { addHated, fetchHateds, removeHated } from '../api/hateds'
import { useAuth } from '../context/AuthContext'
import type { Hated } from '../types'

export function useHateds() {
  const { token, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data: hateds = [] as Hated[] } = useQuery({
    queryKey: ['hateds'],
    queryFn: () => fetchHateds(token!),
    enabled: isAuthenticated,
  })

  const hatedMovieIds = new Set(hateds.map(h => h.movie_id))

  const addMutation = useMutation({
    mutationFn: (movieId: string) => addHated(movieId, token!),
    onMutate: async (movieId: string) => {
      await queryClient.cancelQueries({ queryKey: ['hateds'] })
      const prev = queryClient.getQueryData<Hated[]>(['hateds'])
      queryClient.setQueryData<Hated[]>(['hateds'], old => [
        ...(old ?? []),
        { user_id: '', movie_id: movieId },
      ])
      return { prev }
    },
    onError: (_err, _movieId, context) => {
      queryClient.setQueryData(['hateds'], context?.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['hateds'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (movieId: string) => removeHated(movieId, token!),
    onMutate: async (movieId: string) => {
      await queryClient.cancelQueries({ queryKey: ['hateds'] })
      const prev = queryClient.getQueryData<Hated[]>(['hateds'])
      queryClient.setQueryData<Hated[]>(['hateds'], old =>
        (old ?? []).filter(h => h.movie_id !== movieId)
      )
      return { prev }
    },
    onError: (_err, _movieId, context) => {
      queryClient.setQueryData(['hateds'], context?.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['hateds'] })
    },
  })

  return {
    hateds,
    hatedMovieIds,
    addHated: (movieId: string) => addMutation.mutate(movieId),
    removeHated: (movieId: string) => removeMutation.mutate(movieId),
    isPending: addMutation.isPending || removeMutation.isPending,
  }
}
