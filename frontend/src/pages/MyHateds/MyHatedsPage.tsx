import { Navigate, useNavigate } from 'react-router-dom'

import { MovieCard } from '../../components/movie-card'
import { useAuth } from '../../context/AuthContext'
import { useHateds } from '../../hooks/useHateds'
import './MyHateds.css'

function MyHatedsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { hateds } = useHateds()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const movies = hateds.filter(h => h.movie).map(h => h.movie!)

  return (
    <div className="my-hateds-page">
      <div className="my-hateds-header">
        <h1 className="my-hateds-title">My Hated Movies</h1>
        <p className="my-hateds-count">
          {movies.length} movie{movies.length !== 1 ? 's' : ''}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className="my-hateds-empty">
          <p>You haven't hated any movies yet.</p>
          <button onClick={() => navigate('/')}>Discover Movies to Hate</button>
        </div>
      ) : (
        <div className="my-hateds-grid">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyHatedsPage
