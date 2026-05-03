import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMovie, fetchMovies } from './movies'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchMovies', () => {
  it('returns movies array on success', async () => {
    const movies = [
      { id: 'abc', title: 'Bad Film', description: 'Awful', release_date: '2020-01-01', rating: 2.5, image_link: '' },
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ movies }),
    })

    const result = await fetchMovies()
    expect(result).toEqual(movies)
  })

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(fetchMovies()).rejects.toThrow('Failed to fetch movies')
  })

  it('throws when fetch rejects (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    await expect(fetchMovies()).rejects.toThrow('Network error')
  })
})

describe('fetchMovie', () => {
  it('returns single movie on success', async () => {
    const movie = { id: 'xyz', title: 'Terrible Movie', description: 'Boring', release_date: '2019-06-01', rating: 1.0, image_link: '' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ movie }),
    })

    const result = await fetchMovie('xyz')
    expect(result).toEqual(movie)
  })

  it('throws when movie not found', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(fetchMovie('missing-id')).rejects.toThrow('Failed to fetch movie')
  })
})
