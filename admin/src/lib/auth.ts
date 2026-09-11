import type { LoggedUserDto } from '@/types/api'

const TOKEN_KEY = 'sp_admin_token'
const USER_KEY = 'sp_admin_user'

export function saveAuth(token: string, user: LoggedUserDto) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  const t = localStorage.getItem(TOKEN_KEY)
  // Garde-fou : ancienne string "undefined" laissée par un bug précédent.
  return t && t !== 'undefined' ? t : null
}

export function getUser(): LoggedUserDto | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw || raw === 'undefined') return null
  try { return JSON.parse(raw) } catch { return null }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
