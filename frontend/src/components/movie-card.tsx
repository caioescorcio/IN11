import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useHateds } from '../hooks/useHateds'
import type { Movie } from '../types'
import './movie-card.css'

interface MovieCardProps {
  movie: Movie
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { hatedMovieIds, addHated, removeHated, isPending } = useHateds()

  const isHated = hatedMovieIds.has(movie.id)

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (isHated) {
      removeHated(movie.id)
    } else {
      addHated(movie.id)
    }
  }

  const fallbackImage = 'https://via.placeholder.com/300x450/1a0505/ff3333?text=NO+IMAGE'

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="movie-card-image-wrapper">
        <img
          src={movie.image_link || fallbackImage}
          alt={movie.title}
          className="movie-card-image"
          onError={e => {
            ;(e.currentTarget as HTMLImageElement).src = fallbackImage
          }}
        />
        <button
          className={`dislike-btn${isHated ? ' dislike-btn--active' : ''}`}
          onClick={handleDislike}
          disabled={isPending}
          title={isHated ? 'Remove from hateds' : 'Add to hateds'}
        >
          {isHated ? '💀 HATED' : '☠ HATE'}
        </button>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        {movie.rating != null && (
          <span className="movie-card-rating">★ {movie.rating.toFixed(1)}</span>
        )}
      </div>
    </div>
  )
}
