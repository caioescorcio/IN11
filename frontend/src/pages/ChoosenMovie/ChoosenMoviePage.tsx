import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { StarDisplay, StarInput } from '../../components/StarRating'
import { deleteComment, hateComment, submitEvaluation, unhateComment } from '../../api/evaluations'
import { fetchMovie } from '../../api/movies'
import { useAuth } from '../../context/AuthContext'
import { useEvaluations } from '../../hooks/useEvaluations'
import { useHateds } from '../../hooks/useHateds'
import type { Evaluation } from '../../types'
import './ChoosenMovie.css'

function EvaluationCard({
  evaluation,
  currentUserId,
  isAdmin,
  token,
  onRefresh,
}: {
  evaluation: Evaluation
  currentUserId: string | undefined
  isAdmin: boolean
  token: string | null
  onRefresh: () => void
}) {
  const [localHated, setLocalHated] = useState(evaluation.has_hated ?? false)
  const [localHates, setLocalHates] = useState(evaluation.hates_count)
  const [voting, setVoting] = useState(false)

  const isOwner = currentUserId === evaluation.user?.user_id

  const handleToggleHate = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!token || isOwner) return
    const prevHated = localHated
    const prevCount = localHates
    setLocalHated(!prevHated)
    setLocalHates(prevHated ? Math.max(0, prevCount - 1) : prevCount + 1)
    setVoting(true)
    try {
      if (prevHated) {
        await unhateComment(evaluation.evaluation_id, token)
      } else {
        await hateComment(evaluation.evaluation_id, token)
      }
    } catch {
      setLocalHated(prevHated)
      setLocalHates(prevCount)
    } finally {
      setVoting(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !window.confirm('Delete this evaluation?')) return
    try {
      await deleteComment(evaluation.evaluation_id, token)
      onRefresh()
    } catch {
      // no-op
    }
  }

  const displayName = evaluation.user
    ? `${evaluation.user.firstname} ${evaluation.user.lastname}`
    : 'Anonymous'

  return (
    <div className="eval-card">
      <div className="eval-card-header">
        <span className="eval-author">{displayName}</span>
        <StarDisplay value={evaluation.hating} />
      </div>
      {evaluation.comment_deleted ? (
        <p className="eval-comment eval-comment--deleted">[Comment removed]</p>
      ) : evaluation.comment ? (
        <p className="eval-comment">{evaluation.comment}</p>
      ) : null}
      <div className="eval-card-footer">
        <span className="eval-date">
          {new Date(evaluation.created_at).toLocaleDateString()}
        </span>
        <div className="eval-actions">
          {token && !isOwner ? (
            <button
              className={`eval-hate-btn${localHated ? ' eval-hate-btn--active' : ''}`}
              onClick={handleToggleHate}
              disabled={voting}
              title={localHated ? 'Remove your hate vote' : 'Hate this comment'}
            >
              🔥 {localHates}
            </button>
          ) : (
            <span className="eval-hates-count">🔥 {localHates}</span>
          )}
          {(isOwner || isAdmin) && (
            <button className="eval-delete-btn" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ChoosenMoviePage() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()
  const { token, user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: movie,
    isLoading: movieLoading,
    error: movieError,
  } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchMovie(movieId!),
    enabled: !!movieId,
  })

  const { evaluations, stats, refetch: refetchEvals } = useEvaluations(movieId)
  const { hatedMovieIds, addHated, removeHated, isPending } = useHateds()

  const isHated = movie ? hatedMovieIds.has(movie.id) : false

  const handleDislike = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (movie) {
      isHated ? removeHated(movie.id) : addHated(movie.id)
    }
  }

  const handleRefresh = () => {
    void refetchEvals()
    void queryClient.invalidateQueries({ queryKey: ['evalStats', movieId] })
    void queryClient.invalidateQueries({ queryKey: ['myEvaluations'] })
  }

  const [hatingScore, setHatingScore] = useState(5)
  const [comment, setComment] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitEval = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !movieId) return
    setSubmitError('')
    setSubmitting(true)
    try {
      await submitEvaluation(movieId, hatingScore, comment, token)
      setComment('')
      setHatingScore(5)
      await refetchEvals()
      void queryClient.invalidateQueries({ queryKey: ['evalStats', movieId] })
      void queryClient.invalidateQueries({ queryKey: ['myEvaluations'] })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (movieLoading) {
    return (
      <div className="movie-page-loading">
        <span className="home-loading-spinner" />
        Loading movie...
      </div>
    )
  }

  if (movieError || !movie) {
    return (
      <div className="movie-page-error">
        <h2>Movie not found</h2>
        <button onClick={() => navigate('/')}>Back to Movies</button>
      </div>
    )
  }

  const fallbackImage = 'https://via.placeholder.com/500x750/1a0505/ff3333?text=NO+IMAGE'

  return (
    <div className="movie-page">
      <div className="movie-page-banner">
        <img
          src={movie.image_link || fallbackImage}
          alt={movie.title}
          className="movie-page-bg"
          onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackImage }}
        />
        <div className="movie-page-overlay" />
        <div className="movie-page-hero">
          <button className="movie-back-btn" onClick={() => navigate('/')}>
            ← Back
          </button>
          <img
            src={movie.image_link || fallbackImage}
            alt={movie.title}
            className="movie-page-poster"
            onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackImage }}
          />
          <div className="movie-page-meta">
            <h1 className="movie-page-title">{movie.title}</h1>
            {movie.release_date && (
              <p className="movie-page-date">
                {new Date(movie.release_date).getFullYear()}
              </p>
            )}
            {movie.rating != null && (
              <p className="movie-page-rating">★ {movie.rating.toFixed(1)} / 10</p>
            )}
            {stats && (
              <div className="movie-page-stats">
                <span className="movie-page-stat">
                  🔥 {stats.average_hating != null ? stats.average_hating.toFixed(1) : '—'} avg hate
                </span>
                <span className="movie-page-stat">
                  💬 {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            <button
              className={`movie-dislike-btn${isHated ? ' movie-dislike-btn--active' : ''}`}
              onClick={handleDislike}
              disabled={isPending}
            >
              {isHated ? '💀 HATED — Click to Remove' : '☠ HATE THIS MOVIE'}
            </button>
          </div>
        </div>
      </div>

      <div className="movie-page-body">
        {movie.description && (
          <section className="movie-page-section">
            <h2 className="movie-page-section-title">About</h2>
            <p className="movie-page-description">{movie.description}</p>
          </section>
        )}

        <section className="movie-page-section">
          <h2 className="movie-page-section-title">
            Critics ({evaluations.length})
          </h2>

          {isAuthenticated ? (
            <form className="eval-form" onSubmit={handleSubmitEval}>
              <h3 className="eval-form-title">Your Verdict</h3>

              <div className="eval-form-row">
                <label className="eval-form-label">Hate Score</label>
                <StarInput value={hatingScore} onChange={setHatingScore} />
              </div>

              <textarea
                className="eval-textarea"
                placeholder="Vent your frustrations here..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />

              {submitError && <p className="eval-error">{submitError}</p>}

              <button type="submit" className="eval-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Hate Review'}
              </button>
            </form>
          ) : (
            <p className="eval-login-prompt">
              <button className="auth-link-btn" onClick={() => navigate('/login')}>
                Sign in
              </button>{' '}
              to leave a hate review.
            </p>
          )}

          <div className="eval-list">
            {evaluations.length === 0 ? (
              <p className="eval-empty">No reviews yet. Be the first to hate it.</p>
            ) : (
              evaluations.map(ev => (
                <EvaluationCard
                  key={ev.evaluation_id}
                  evaluation={ev}
                  currentUserId={user?.userId}
                  isAdmin={user?.is_admin ?? false}
                  token={token}
                  onRefresh={handleRefresh}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ChoosenMoviePage
