'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiRequest } from '@/lib/api'

type AuthUser = {
  id: string
  name: string
  role: string
  email: string
  accountType: 'doctor' | 'patient'
}

type SignInPayload = {
  email: string
  password: string
  remember: boolean
}

type AuthContextValue = {
  isReady: boolean
  isAuthenticated: boolean
  user: AuthUser | null
  signIn: (payload: SignInPayload) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toAuthUser(user: { id: string; name: string; email: string; role: 'DOCTOR' | 'PATIENT' }): AuthUser {
  return {
    ...user,
    accountType: user.role === 'PATIENT' ? 'patient' : 'doctor',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    apiRequest<{ id: string; name: string; email: string; role: 'DOCTOR' | 'PATIENT' }>('/api/auth/me')
      .then((currentUser) => setUser(toAuthUser(currentUser)))
      .catch(() => undefined)
      .finally(() => setIsReady(true))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: Boolean(user),
      user,
      signIn: async ({ email, password, remember }) => {
        const response = await apiRequest<{
          user: { id: string; name: string; email: string; role: 'DOCTOR' | 'PATIENT' }
        }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password, remember }),
        })
        setUser(toAuthUser(response.user))
      },
      signOut: async () => {
        await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
        window.localStorage.removeItem('aarogyam-auth')
        window.sessionStorage.removeItem('aarogyam-auth')
        window.localStorage.removeItem('aarogyam-token')
        window.sessionStorage.removeItem('aarogyam-token')
        setUser(null)
      },
    }),
    [isReady, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
