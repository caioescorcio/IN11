import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import Home from './Home'

vi.mock('../../hooks/useBackendMovies', () => ({
  useBackendMovies: () => ({
    movies: [
      { id: 'a1', title: 'Inception', description: '', release_date: '2010-07-16', rating: 8.8, image_link: '' },
      { id: 'b2', title: 'Film A', description: '', release_date: '2021-01-01', rating: 4.0, image_link: '' },
      { id: 'c3', title: 'Film B', description: '', release_date: '2022-05-10', rating: 3.5, image_link: '' },
    ],
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, token: null, user: null }),
}))

vi.mock('../../hooks/useHateds', () => ({
  useHateds: () => ({
    hatedMovieIds: new Set<string>(),
    addHated: vi.fn(),
    removeHated: vi.fn(),
    isPending: false,
  }),
}))

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )

it('displays the main heading', () => {
  renderHome()
  expect(screen.getByText('HATE THE MOVIES')).toBeInTheDocument()
})

it('displays all movies when search bar is empty', () => {
  renderHome()
  expect(screen.getByText('Inception')).toBeInTheDocument()
  expect(screen.getByText('Film A')).toBeInTheDocument()
  expect(screen.getByText('Film B')).toBeInTheDocument()
})

it('filters movies when user types in the search bar', async () => {
  const user = userEvent.setup()
  renderHome()

  const searchBar = screen.getByPlaceholderText('Search movies to hate...')
  await user.type(searchBar, 'Film')

  expect(screen.queryByText('Inception')).not.toBeInTheDocument()
  expect(screen.getByText('Film A')).toBeInTheDocument()
  expect(screen.getByText('Film B')).toBeInTheDocument()
})

it('shows no movies when search matches nothing', async () => {
  const user = userEvent.setup()
  renderHome()

  const searchBar = screen.getByPlaceholderText('Search movies to hate...')
  await user.type(searchBar, 'ZZZXXX')

  expect(screen.queryByText('Inception')).not.toBeInTheDocument()
  expect(screen.queryByText('Film A')).not.toBeInTheDocument()
  expect(screen.queryByText('Film B')).not.toBeInTheDocument()
})

it('shows movie count', () => {
  renderHome()
  expect(screen.getByText('3 movies found')).toBeInTheDocument()
})
