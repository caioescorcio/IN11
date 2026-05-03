import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addHated, fetchHateds, removeHated } from './hateds'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const TOKEN = 'test-token'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchHateds', () => {
  it('returns hateds array on success', async () => {
    const hateds = [{ user_id: 'u1', movie_id: 'm1' }]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Hateds: hateds }),
    })

    const result = await fetchHateds(TOKEN)
    expect(result).toEqual(hateds)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/hateds'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    )
  })

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(fetchHateds(TOKEN)).rejects.toThrow('Failed to fetch hateds')
  })
})

describe('addHated', () => {
  it('resolves without value on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    await expect(addHated('movie-id', TOKEN)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/hateds/add'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws with server message on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Already hated' }),
    })

    await expect(addHated('movie-id', TOKEN)).rejects.toThrow('Already hated')
  })

  it('throws generic message when server provides none', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    await expect(addHated('movie-id', TOKEN)).rejects.toThrow('Failed to add hated')
  })
})

describe('removeHated', () => {
  it('resolves without value on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    await expect(removeHated('movie-id', TOKEN)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/hateds/movie-id'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(removeHated('movie-id', TOKEN)).rejects.toThrow('Failed to remove hated')
  })
})
