'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { saveAuth, getUser, clearAuth, isAuthenticated as checkAuth } from '@/lib/auth'
import type { AuthResponse, AdminUserDto } from '@/types/api'

interface AuthContextValue {
  user: AdminUserDto | null
  isAuthenticated: boolean
  login: (auth: AuthResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUserDto | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (checkAuth()) {
      setUser(getUser())
      setIsAuthenticated(true)
    }
  }, [])

  function login(auth: AuthResponse) {
    saveAuth(auth.token, auth.user)
    setUser(auth.user)
    setIsAuthenticated(true)
  }

  function logout() {
    clearAuth()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
