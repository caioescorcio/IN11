const API_URL = import.meta.env.VITE_API_URL

export interface LoginResponse {
  message: string
  token: string
}

export interface SignupData {
  email: string
  firstname: string
  lastname: string
  password: string
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Login failed')
  return data as LoginResponse
}

export async function signupUser(userData: SignupData): Promise<{ user_id: string; email: string }> {
  const res = await fetch(`${API_URL}/users/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Signup failed')
  return data
}
