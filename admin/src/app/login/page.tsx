'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { AuthResponse } from '@/types/api'

interface LoginResponse { requiresTwoFactor: boolean; email: string; codeExpiryMinutes: number }
type Step = 'credentials' | 'code'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeExpiryMinutes, setCodeExpiryMinutes] = useState(10)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (step === 'credentials') {
        const res = await api.post<LoginResponse>('/api/auth/login', { email, password })
        setCodeExpiryMinutes(res.codeExpiryMinutes)
        setStep('code')
      } else {
        const auth = await api.post<AuthResponse>('/api/auth/login-verify', { email, code })
        if (!auth.user.isAdmin) {
          setError('Accès réservé aux administrateurs.')
          return
        }
        login(auth)
        router.push('/dashboard')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError('Email ou mot de passe incorrect.')
        else if (err.status === 403) setError(err.message || 'Code invalide ou expiré.')
        else setError('Une erreur est survenue.')
      } else {
        setError('Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function resendCode() {
    setError(''); setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password })
      setCodeExpiryMinutes(res.codeExpiryMinutes)
      setCode('')
    } catch {
      setError('Impossible de renvoyer le code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SimplexPay Admin</h1>
          <p className="text-slate-400 mt-1 text-sm">Accès réservé aux administrateurs</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5 shadow-xl">
          {step === 'credentials' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                  autoComplete="current-password"
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Un code à 6 chiffres a été envoyé à{' '}
                <span className="font-semibold text-slate-900">{email}</span>.
                Il expire dans {codeExpiryMinutes} min.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Code de vérification</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="w-full border border-border rounded-lg px-4 py-3 text-2xl text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </>
          )}

          {error && <div className="text-sm text-destructive bg-red-50 rounded-lg p-3">{error}</div>}

          <button
            type="submit"
            disabled={loading || (step === 'code' && code.length !== 6)}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {loading
              ? (step === 'credentials' ? 'Envoi du code…' : 'Vérification…')
              : (step === 'credentials' ? 'Continuer' : 'Se connecter')}
          </button>

          {step === 'code' && (
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep('credentials'); setCode(''); setError('') }}
                className="text-slate-500 hover:text-slate-900 font-medium"
              >
                ← Changer d&apos;identifiants
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={loading}
                className="text-primary hover:underline font-semibold disabled:opacity-50"
              >
                Renvoyer le code
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
