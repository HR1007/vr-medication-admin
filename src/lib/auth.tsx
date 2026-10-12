import { createContext, useContext, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Simulated sign-in for the demo. There is no server: any username / password
 * is accepted and the session lives in the browser only.
 * "Remember me" keeps the session in localStorage, otherwise sessionStorage.
 */
const SESSION_KEY = 'vrma-session'

export type SessionUser = { username: string; displayName: string; role: string }

const DEMO_USER: Omit<SessionUser, 'username'> = { displayName: '陳瑪麗老師', role: '中心主任' }

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

type AuthValue = {
  user: SessionUser | null
  login: (username: string, remember: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readSession)

  const login = (username: string, remember: boolean) => {
    const next = { username, ...DEMO_USER }
    try {
      ;(remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable — session lasts until reload
    }
    setUser(next)
  }

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore
    }
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
