import type { Movie } from '../types'

const API_URL = import.meta.env.VITE_API_URL

export async function fetchMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/movies`)
  if (!res.ok) throw new Error('Failed to fetch movies')
  const data = await res.json()
  return data.movies as Movie[]
}

export async function fetchMovie(movieId: string): Promise<Movie> {
  const res = await fetch(`${API_URL}/movies/${movieId}`)
  if (!res.ok) throw new Error('Failed to fetch movie')
  const data = await res.json()
  return data.movie as Movie
}
