import { Link, Navigate, useNavigate } from 'react-router-dom'

import { StarDisplay } from '../../components/StarRating'
import { useAuth } from '../../context/AuthContext'
import { useMyEvaluations } from '../../hooks/useMyEvaluations'
import './MyEvaluations.css'

const FALLBACK_IMG = 'https://via.placeholder.com/60x90/1a0505/ff3333?text=?'

function MyEvaluationsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { evaluations, isLoading } = useMyEvaluations()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="my-evals-page">
      <div className="my-evals-header">
        <h1 className="my-evals-title">My Reviews</h1>
        <p className="my-evals-count">
          {evaluations.length} review{evaluations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="my-evals-loading">Loading...</div>
      ) : evaluations.length === 0 ? (
        <div className="my-evals-empty">
          <p>You haven't reviewed any movies yet.</p>
          <button onClick={() => navigate('/')}>Find Movies to Review</button>
        </div>
      ) : (
        <div className="my-evals-list">
          {evaluations.map(ev => (
            <div key={ev.evaluation_id} className="my-eval-card">
              {ev.movie && (
                <Link to={`/movie/${ev.movie.id}`} className="my-eval-movie">
                  <img
                    src={ev.movie.image_link || FALLBACK_IMG}
                    alt={ev.movie.title}
                    className="my-eval-poster"
                    onError={e => {
                      ;(e.currentTarget as HTMLImageElement).src = FALLBACK_IMG
                    }}
                  />
                  <span className="my-eval-movie-title">{ev.movie.title}</span>
                </Link>
              )}
              <div className="my-eval-content">
                <div className="my-eval-rating">
                  <StarDisplay value={ev.hating} />
                  <span className="my-eval-score">{ev.hating} / 10</span>
                </div>
                {ev.comment_deleted ? (
                  <p className="my-eval-comment my-eval-comment--deleted">[Comment removed]</p>
                ) : ev.comment ? (
                  <p className="my-eval-comment">{ev.comment}</p>
                ) : null}
                <div className="my-eval-footer">
                  <span className="my-eval-date">
                    {new Date(ev.updated_at).toLocaleDateString()}
                  </span>
                  <span className="my-eval-hates">🔥 {ev.hates_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyEvaluationsPage
