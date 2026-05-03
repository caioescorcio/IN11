import type { Hated } from '../types'

const API_URL = import.meta.env.VITE_API_URL

export async function fetchHateds(token: string): Promise<Hated[]> {
  const res = await fetch(`${API_URL}/hateds`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch hateds')
  const data = await res.json()
  return data.Hateds as Hated[]
}

export async function addHated(movieId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/hateds/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ movie_id: movieId }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to add hated')
  }
}

export async function removeHated(movieId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/hateds/${movieId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to remove hated')
}
