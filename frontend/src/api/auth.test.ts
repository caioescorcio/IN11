import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { loginUser, signupUser } from './auth'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loginUser', () => {
  it('returns token on successful login', async () => {
    const response = { message: 'OK', token: 'jwt-token-123' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    })

    const result = await loginUser('user@test.com', 'password')
    expect(result.token).toBe('jwt-token-123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/login'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws with server error message on failed login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    })

    await expect(loginUser('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('throws generic message when server provides none', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    await expect(loginUser('bad@test.com', 'wrong')).rejects.toThrow('Login failed')
  })

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    await expect(loginUser('a@b.com', 'p')).rejects.toThrow('Network error')
  })
})

describe('signupUser', () => {
  it('returns created user on success', async () => {
    const user = { user_id: 'uuid-1', email: 'new@test.com' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => user,
    })

    const result = await signupUser({
      email: 'new@test.com',
      firstname: 'Test',
      lastname: 'User',
      password: 'pass123',
    })
    expect(result.email).toBe('new@test.com')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/new'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws with server message when email already exists', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email already in use' }),
    })

    await expect(
      signupUser({ email: 'dup@test.com', firstname: 'A', lastname: 'B', password: 'p' })
    ).rejects.toThrow('Email already in use')
  })

  it('throws generic message when server provides none', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    await expect(
      signupUser({ email: 'x@x.com', firstname: 'X', lastname: 'X', password: 'x' })
    ).rejects.toThrow('Signup failed')
  })
})
