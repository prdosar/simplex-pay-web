'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUser, clearAuth, saveAuth } from '@/lib/auth'
import type { UserDto, AuthResponse } from '@/types/api'

interface AuthContextType {
  user: UserDto | null
  isAuthenticated: boolean
  login: (auth: AuthResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  function login(auth: AuthResponse) {
    saveAuth(auth.accessToken, auth.user)
    setUser(auth.user)
  }

  function logout() {
    clearAuth()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
