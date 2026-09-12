const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080'

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
  }
}

// Purge localStorage + redirige vers /auth/connexion quand le JWT est mort.
// Évite qu'un token périmé laisse l'app dans un état "connecté" avec toutes les requêtes en 401.
function handleUnauthorized() {
  if (typeof window === 'undefined') return
  const hadToken = !!localStorage.getItem('sp_token')
  if (!hadToken) return  // 401 sans token = endpoint qui exige auth, pas notre problème d'expiration
  localStorage.removeItem('sp_token')
  localStorage.removeItem('sp_user')
  // Préserve le locale actuel (/fr/... ou /en/...) et évite les boucles depuis les pages d'auth.
  const path = window.location.pathname
  if (path.startsWith('/fr/auth/') || path.startsWith('/en/auth/')) return
  const locale = path.startsWith('/en') ? 'en' : 'fr'
  window.location.href = `/${locale}/auth/connexion?expired=1`
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sp_token') : null

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    handleUnauthorized()
    throw new ApiError(401, 'Unauthorized')
  }

  if (res.status === 204) return null as T

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const msg = data?.title || data?.message || `HTTP ${res.status}`
    throw new ApiError(res.status, msg, data)
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
