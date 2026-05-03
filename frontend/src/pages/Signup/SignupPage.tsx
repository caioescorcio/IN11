import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { loginUser, signupUser } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import '../Login/Login.css'

function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signupUser(form)
      const loginData = await loginUser(form.email, form.password)
      login(loginData.token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">JOIN US</h1>
        <p className="auth-subtitle">Start hating movies officially.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="firstname" className="auth-label">First Name</label>
            <input
              id="firstname"
              name="firstname"
              type="text"
              className="auth-input"
              placeholder="John"
              value={form.firstname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="lastname" className="auth-label">Last Name</label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              className="auth-input"
              placeholder="Doe"
              value={form.lastname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already a critic?{' '}
          <button className="auth-link-btn" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
