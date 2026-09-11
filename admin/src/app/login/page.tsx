'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { AuthResponse } from '@/types/api'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const auth = await api.post<AuthResponse>('/api/auth/login', { email, password })
      // Bloque l'accès aux non-admins (le backend renverrait de toute façon 403 sur les endpoints /api/admin/*).
      if (!auth.user.isAdmin) {
        setError('Accès réservé aux administrateurs.')
        return
      }
      login(auth)
      router.push('/dashboard')
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-sidebar]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[--color-primary] rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SimplexPay Admin</h1>
          <p className="text-slate-400 mt-1 text-sm">Accès réservé aux administrateurs</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5 shadow-xl">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-[--color-border] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              placeholder="admin@simplexpay.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-[--color-border] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
            />
          </div>

          {error && (
            <div className="text-sm text-[--color-destructive] bg-red-50 rounded-lg p-3">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[--color-primary] text-white font-semibold rounded-xl hover:bg-[--color-primary-dark] transition-colors disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
