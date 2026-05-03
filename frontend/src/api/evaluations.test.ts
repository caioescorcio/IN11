import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deleteComment,
  fetchEvaluationStats,
  fetchEvaluations,
  hateComment,
  submitEvaluation,
  unhateComment,
} from './evaluations'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const TOKEN = 'test-token'
const MOVIE_ID = 'movie-123'
const EVAL_ID = 'eval-456'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchEvaluations', () => {
  it('returns evaluations array on success', async () => {
    const evaluations = [
      {
        evaluation_id: EVAL_ID,
        hating: 8.5,
        comment: 'Awful movie',
        comment_deleted: false,
        hates_count: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: { user_id: 'u1', email: 'a@b.com', firstname: 'Jane', lastname: 'Doe' },
      },
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ evaluations }),
    })

    const result = await fetchEvaluations(MOVIE_ID)
    expect(result).toEqual(evaluations)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/evaluations/movie/${MOVIE_ID}`)
    )
  })

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(fetchEvaluations(MOVIE_ID)).rejects.toThrow('Failed to fetch evaluations')
  })
})

describe('fetchEvaluationStats', () => {
  it('returns stats on success', async () => {
    const stats = { average_hating: 7.2, total_reviews: 5 }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => stats,
    })

    const result = await fetchEvaluationStats(MOVIE_ID)
    expect(result).toEqual(stats)
  })

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(fetchEvaluationStats(MOVIE_ID)).rejects.toThrow(
      'Failed to fetch evaluation stats'
    )
  })
})

describe('submitEvaluation', () => {
  it('posts evaluation and returns result', async () => {
    const evaluation = { evaluation_id: EVAL_ID, hating: 9, comment: 'Terrible' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => evaluation,
    })

    const result = await submitEvaluation(MOVIE_ID, 9, 'Terrible', TOKEN)
    expect(result).toEqual(evaluation)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/evaluations/movie/${MOVIE_ID}`),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    )
  })

  it('throws with server message on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    })

    await expect(submitEvaluation(MOVIE_ID, 5, '', TOKEN)).rejects.toThrow('Unauthorized')
  })
})

describe('hateComment', () => {
  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    await expect(hateComment(EVAL_ID, TOKEN)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/evaluations/${EVAL_ID}/hate`),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(hateComment(EVAL_ID, TOKEN)).rejects.toThrow('Failed to register hate')
  })
})

describe('unhateComment', () => {
  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    await expect(unhateComment(EVAL_ID, TOKEN)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/evaluations/${EVAL_ID}/hate`),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(unhateComment(EVAL_ID, TOKEN)).rejects.toThrow('Failed to unregister hate')
  })
})

describe('deleteComment', () => {
  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    await expect(deleteComment(EVAL_ID, TOKEN)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/evaluations/${EVAL_ID}/comment`),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(deleteComment(EVAL_ID, TOKEN)).rejects.toThrow('Failed to delete comment')
  })
})
