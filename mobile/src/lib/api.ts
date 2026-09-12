import { getToken, clearAuth } from './auth'

// Prod par défaut — override via .env avec EXPO_PUBLIC_API_URL=http://192.168.x.x:5041
// pour tester contre l'API locale depuis un device physique.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://apichange.simplex-pay.com'

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
  }
}

let onUnauthorized: (() => void) | null = null

/** Enregistré depuis AuthContext pour déclencher un logout auto quand le token expire. */
export function setOnUnauthorized(cb: () => void): void {
  onUnauthorized = cb
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    if (token) {
      await clearAuth()
      onUnauthorized?.()
    }
    throw new ApiError(401, 'Unauthorized')
  }

  if (res.status === 204) return null as T

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const msg = (data as { title?: string; message?: string })?.title
      ?? (data as { message?: string })?.message
      ?? `HTTP ${res.status}`
    throw new ApiError(res.status, msg, data)
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export { API_URL }
