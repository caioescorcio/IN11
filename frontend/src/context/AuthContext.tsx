import { createContext, useCallback, useContext, useState } from 'react'

import type { DecodedToken } from '../types'

function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload)) as DecodedToken
  } catch {
    return null
  }
}

interface AuthContextType {
  token: string | null
  user: DecodedToken | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const [user, setUser] = useState<DecodedToken | null>(() => {
    const stored = localStorage.getItem('auth_token')
    return stored ? decodeToken(stored) : null
  })

  const login = useCallback((newToken: string) => {
    localStorage.setItem('auth_token', newToken)
    setToken(newToken)
    setUser(decodeToken(newToken))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
