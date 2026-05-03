import { useQuery } from '@tanstack/react-query'

import { fetchMovies } from '../api/movies'
import type { Movie } from '../types'

export function useBackendMovies() {
  const {
    data: movies = [] as Movie[],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['backendMovies'],
    queryFn: fetchMovies,
  })
  return { movies, isLoading, error }
}
