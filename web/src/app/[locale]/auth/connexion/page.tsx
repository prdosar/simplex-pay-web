'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { flagUrl } from '@/lib/utils'
import type { AuthResponse } from '@/types/api'

export default function LoginPage() {
  const t = useTranslations('auth.login')
  const tHome = useTranslations('home')
  const locale = useLocale()
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const auth = await api.post<AuthResponse>('/api/auth/login', { email, password })
      login(auth)
      router.push(`/${locale}`)
    } catch (err: unknown) {
      const e = err as { status?: number }
      setError(
        e.status === 401
          ? (locale === 'fr' ? 'Email ou mot de passe incorrect.' : 'Invalid email or password.')
          : (locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')
      )
    } finally {
      setLoading(false)
    }
  }

  const trustPoints = [
    tHome('hero.trust1'),
    tHome('hero.trust3'),
  ]

  return (
    <div className="flex min-h-[calc(100vh-72px)]">

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 px-10 py-12"
        style={{ background: '#0f172a' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-0.5 text-[22px] font-extrabold">
          <span style={{ color: '#0d9488' }}>Simplex</span>
          <span className="text-white">Pay</span>
        </div>

        {/* Center message */}
        <div>
          <p
            className="inline-block text-[11px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 rounded-full mb-5"
            style={{ color: '#0f766e', background: 'rgba(13,148,136,0.15)' }}
          >
            {tHome('hero.badge')}
          </p>
          <h2 className="text-[28px] font-extrabold leading-[1.15] text-white mb-4">
            {tHome('hero.title')}
          </h2>
          <p className="text-[15px] leading-relaxed mb-8" style={{ color: '#94a3b8' }}>
            {tHome('hero.subtitle')}
          </p>
          <div className="flex flex-col gap-3">
            {trustPoints.map((pt, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                  style={{ background: 'rgba(13,148,136,0.2)', color: '#2dd4bf' }}
                >✓</span>
                <span className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini demo card — Kilos Voyage (avion) */}
        <div
          className="rounded-[16px] overflow-hidden border"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
        >
          <div className="h-[4px]" style={{ background: 'linear-gradient(90deg,#0d9488,#f97316)' }} />
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0d9488' }} aria-hidden>
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
                <span>{locale === 'fr' ? 'Kilos voyage' : 'Travel kilos'}</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: '#0d9488', background: 'rgba(13,148,136,0.15)' }}>
                {locale === 'fr' ? 'Actif' : 'Active'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-white mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl('fr')} alt="FR" className="w-[18px] h-[13px] rounded-sm object-cover" />
              <span className="font-semibold">Paris</span>
              <span style={{ color: '#475569' }}>→</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl('sn')} alt="SN" className="w-[18px] h-[13px] rounded-sm object-cover" />
              <span className="font-semibold">Dakar</span>
            </div>

            <p className="text-[10px] uppercase tracking-[0.06em] mb-0.5" style={{ color: '#475569' }}>
              {locale === 'fr' ? 'Disponible' : 'Available'}
            </p>
            <p className="text-[22px] font-extrabold" style={{ color: '#0d9488' }}>
              12 kg <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>· 15 €/kg</span>
            </p>
            <p className="text-[11px] mt-1" style={{ color: '#94a3b8' }}>
              {locale === 'fr' ? 'Départ 20 sept.' : 'Departs Sept 20'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-0.5 text-[22px] font-extrabold mb-8 lg:hidden">
            <span style={{ color: '#0d9488' }}>Simplex</span>
            <span style={{ color: '#0f172a' }}>Pay</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-extrabold tracking-[-0.01em]" style={{ color: '#0f172a' }}>
              {t('title')}
            </h1>
            <p className="text-[15px] mt-1.5" style={{ color: '#64748b' }}>{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] rounded-2xl p-8 space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="vous@email.com"
                className="w-full border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488] transition-shadow"
                style={{ color: '#0f172a' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488] transition-shadow pr-12"
                  style={{ color: '#0f172a' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px]"
                  style={{ color: '#94a3b8' }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm rounded-lg p-3 border" style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-[15px] font-bold text-white rounded-[10px] transition-colors disabled:opacity-60"
              style={{ background: '#0d9488' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0f766e' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0d9488' }}
            >
              {loading
                ? (locale === 'fr' ? 'Connexion…' : 'Logging in…')
                : t('submit')}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#f1f5f9]" />
              </div>
            </div>

            <p className="text-center text-[13px]" style={{ color: '#64748b' }}>
              {t('noAccount')}{' '}
              <Link
                href={`/${locale}/auth/inscription`}
                className="font-bold hover:underline"
                style={{ color: '#0d9488' }}
              >
                {t('register')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
