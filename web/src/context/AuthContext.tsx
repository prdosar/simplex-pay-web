'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUser, clearAuth, saveAuth, getToken } from '@/lib/auth'
import type { UserDto, AuthResponse } from '@/types/api'

interface AuthContextType {
  user: UserDto | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (auth: AuthResponse) => void
  logout: () => void
  /** Met à jour le user en state + localStorage (utile après édition du profil). */
  refreshUser: (user: UserDto) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getUser())
    setIsLoading(false)
  }, [])

  function login(auth: AuthResponse) {
    saveAuth(auth.accessToken, auth.user)
    setUser(auth.user)
  }

  function logout() {
    clearAuth()
    setUser(null)
  }

  function refreshUser(updated: UserDto) {
    // Le token reste identique (pas régénéré côté backend pour une modif profil).
    const token = getToken()
    if (token) saveAuth(token, updated)
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
