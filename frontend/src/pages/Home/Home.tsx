import { useMemo, useState } from 'react'

import { MovieCard } from '../../components/movie-card'
import { useBackendMovies } from '../../hooks/useBackendMovies'
import './Home.css'

function Home() {
  const [searchInput, setSearchInput] = useState('')
  const { movies, isLoading, error } = useBackendMovies()

  const filtered = useMemo(
    () => movies.filter(m => m.title.toLowerCase().includes(searchInput.toLowerCase())),
    [movies, searchInput]
  )

  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">HATE THE MOVIES</h1>
        <p className="home-subtitle">
          Rate the worst. Vent your frustrations. Join the critics.
        </p>
        <input
          className="home-search"
          type="text"
          placeholder="Search movies to hate..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
      </div>

      {error && (
        <p className="home-error">Failed to load movies. Is the backend running?</p>
      )}

      {isLoading ? (
        <div className="home-loading">
          <span className="home-loading-spinner" />
          Loading movies...
        </div>
      ) : (
        <>
          <p className="home-count">
            {filtered.length} movie{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="home-grid">
            {filtered.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          {filtered.length === 0 && !isLoading && (
            <p className="home-empty">No movies match your search.</p>
          )}
        </>
      )}
    </div>
  )
}

export default Home
