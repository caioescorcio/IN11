import { useQueryClient } from '@tanstack/react-query'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import { useAuth } from './context/AuthContext'
import ChoosenMoviePage from './pages/ChoosenMovie/ChoosenMoviePage'
import Home from './pages/Home/Home'
import LoginPage from './pages/Login/LoginPage'
import MyEvaluationsPage from './pages/MyEvaluations/MyEvaluationsPage'
import MyHatedsPage from './pages/MyHateds/MyHatedsPage'
import SignupPage from './pages/Signup/SignupPage'
import './App.css'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/')
  }

  const displayName = user
    ? user.is_admin
      ? `${user.firstname} (admin)`
      : user.firstname
    : ''

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        💀 HATE MOVIES
      </Link>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to="/my-hateds" className="navbar-link">My Hateds</Link>
            <Link to="/my-evaluations" className="navbar-link">My Reviews</Link>
            <span className="navbar-user">👤 {displayName}</span>
            <button className="navbar-btn navbar-btn--outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Sign In</Link>
            <Link to="/signup" className="navbar-btn">Join</Link>
          </>
        )}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:movieId" element={<ChoosenMoviePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/my-hateds" element={<MyHatedsPage />} />
          <Route path="/my-evaluations" element={<MyEvaluationsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
