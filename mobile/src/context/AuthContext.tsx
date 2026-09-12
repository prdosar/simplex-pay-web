import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { router } from 'expo-router'
import { getUser, saveAuth, clearAuth } from '@/src/lib/auth'
import { setOnUnauthorized } from '@/src/lib/api'
import type { UserDto, AuthResponse } from '@/src/types/api'

interface AuthContextType {
  user: UserDto | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (auth: AuthResponse) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hydrate au démarrage depuis le SecureStore.
    getUser().then(u => { setUser(u); setIsLoading(false) })
  }, [])

  useEffect(() => {
    // Hook global : si l'API renvoie 401, on purge et on renvoie vers login.
    setOnUnauthorized(() => {
      setUser(null)
      router.replace('/auth/login')
    })
  }, [])

  async function login(auth: AuthResponse) {
    await saveAuth(auth.accessToken, auth.user)
    setUser(auth.user)
  }

  async function logout() {
    await clearAuth()
    setUser(null)
    router.replace('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
