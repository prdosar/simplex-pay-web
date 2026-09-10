'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { AuthResponse } from '@/types/api'

function VerifyEmailInner() {
  const t = useTranslations('auth.verify')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login } = useAuth()

  const email = searchParams.get('email') ?? user?.email ?? ''

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const auth = await api.post<AuthResponse>('/api/auth/verify-email', { email, code })
      login(auth)
      setInfo(t('success'))
      setTimeout(() => router.push(`/${locale}`), 800)
    } catch (err) {
      const e = err as ApiError
      if (e.status === 403) setError(t('errorInvalid'))
      else setError(t('errorInvalid'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setInfo('')
    setResending(true)
    try {
      await api.post('/api/auth/resend-code', { email })
      setInfo(t('resent'))
    } catch {
      setError(locale === 'fr' ? 'Impossible de renvoyer le code.' : 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-[440px]">
        <div className="flex items-center justify-center gap-0.5 text-[22px] font-extrabold mb-8">
          <span style={{ color: '#0d9488' }}>Simplex</span>
          <span style={{ color: '#0f172a' }}>Pay</span>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8">
          <h1 className="text-[24px] font-extrabold tracking-[-0.01em] mb-2" style={{ color: '#0f172a' }}>
            {t('title')}
          </h1>
          <p className="text-[14px] mb-6" style={{ color: '#64748b' }}>
            {t('subtitle', { email })}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                {t('codeLabel')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder={t('codePlaceholder')}
                required
                className="w-full border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-center text-[22px] font-bold tracking-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488] transition-shadow"
                style={{ color: '#0f172a' }}
              />
            </div>

            {error && (
              <div className="text-sm rounded-lg p-3 border" style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}>
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm rounded-lg p-3 border" style={{ color: '#0f766e', background: '#f0fdfa', borderColor: '#99f6e4' }}>
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 text-[15px] font-bold text-white rounded-[10px] transition-colors disabled:opacity-60"
              style={{ background: '#0d9488' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0f766e' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0d9488' }}
            >
              {loading ? t('verifying') : t('submit')}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full py-2 text-[13px] font-semibold rounded-[10px] transition-colors disabled:opacity-50"
              style={{ color: '#0d9488', background: 'transparent' }}
            >
              {resending ? t('resending') : t('resend')}
            </button>
          </form>

          <p className="text-center text-[13px] mt-6" style={{ color: '#64748b' }}>
            <Link href={`/${locale}/auth/connexion`} className="font-semibold hover:underline" style={{ color: '#0d9488' }}>
              {locale === 'fr' ? '← Retour à la connexion' : '← Back to login'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-72px)]" style={{ background: '#f8fafc' }} />}>
      <VerifyEmailInner />
    </Suspense>
  )
}
