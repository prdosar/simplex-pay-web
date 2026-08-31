'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { UserDto } from '@/types/api';

interface AuthContextType {
  user: UserDto | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: UserDto | null
  children: ReactNode
}) {
  return (
    <AuthContext.Provider value={{ user: initialUser, isAuthenticated: !!initialUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
