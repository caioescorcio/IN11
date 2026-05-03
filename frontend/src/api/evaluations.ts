import type { Evaluation, EvaluationStats } from '../types'

const API_URL = import.meta.env.VITE_API_URL

export async function fetchEvaluations(movieId: string): Promise<Evaluation[]> {
  const res = await fetch(`${API_URL}/evaluations/movie/${movieId}`)
  if (!res.ok) throw new Error('Failed to fetch evaluations')
  const data = await res.json()
  return data.evaluations as Evaluation[]
}

export async function fetchEvaluationStats(movieId: string): Promise<EvaluationStats> {
  const res = await fetch(`${API_URL}/evaluations/movie/${movieId}/stats`)
  if (!res.ok) throw new Error('Failed to fetch evaluation stats')
  return res.json() as Promise<EvaluationStats>
}

export async function submitEvaluation(
  movieId: string,
  hating: number,
  comment: string,
  token: string
): Promise<Evaluation> {
  const res = await fetch(`${API_URL}/evaluations/movie/${movieId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hating, comment }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to submit evaluation')
  return data as Evaluation
}

export async function hateComment(evaluationId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/evaluations/${evaluationId}/hate`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to register hate')
  }
}

export async function unhateComment(evaluationId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/evaluations/${evaluationId}/hate`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to unregister hate')
  }
}

export async function deleteComment(evaluationId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/evaluations/${evaluationId}/comment`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete comment')
}

export async function fetchMyEvaluations(token: string): Promise<Evaluation[]> {
  const res = await fetch(`${API_URL}/evaluations/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch your evaluations')
  const data = await res.json()
  return data.evaluations as Evaluation[]
}
