'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { flagUrl } from '@/lib/utils'
import type { AuthResponse, CountryDto } from '@/types/api'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const tHome = useTranslations('home')
  const locale = useLocale()
  const router = useRouter()
  const { login } = useAuth()

  const { data: countries } = useSWR<CountryDto[]>(
    '/api/countries',
    (url: string) => api.get<CountryDto[]>(url)
  )

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    country: '',
    whatsAppNumber: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const countryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node))
        setCountryOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      const { confirmPassword: _cp, ...rest } = form
      const body = { ...rest, whatsAppNumber: form.whatsAppNumber || undefined }
      const auth = await api.post<AuthResponse>('/api/auth/register', body)
      login(auth)
      router.push(`/${locale}/auth/verifier-email?email=${encodeURIComponent(form.email)}`)
    } catch (err: unknown) {
      const e = err as { status?: number; errors?: Record<string, string[]> }
      if (e.status === 409)
        setError(locale === 'fr' ? 'Un compte avec cet email existe déjà.' : 'An account with this email already exists.')
      else if (e.errors)
        setError(Object.values(e.errors).flat().join(' '))
      else
        setError(locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const trustPoints = [
    tHome('hero.trust1'),
    tHome('hero.trust2'),
    tHome('hero.trust3'),
  ]

  const inputClass = "w-full border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488] transition-shadow"

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

        {/* Mini demo card */}
        <div
          className="rounded-[16px] overflow-hidden border"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
        >
          <div className="h-[4px]" style={{ background: 'linear-gradient(90deg,#0d9488,#f97316)' }} />
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl('fr')} alt="FR" className="w-[18px] h-[13px] rounded-sm object-cover" />
                <span>EUR</span>
                <span style={{ color: '#475569' }}>→</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl('sn')} alt="SN" className="w-[18px] h-[13px] rounded-sm object-cover" />
                <span>XOF</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: '#0d9488', background: 'rgba(13,148,136,0.15)' }}>
                Active
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.06em] mb-0.5" style={{ color: '#475569' }}>Taux</p>
            <p className="text-[22px] font-extrabold" style={{ color: '#0d9488' }}>
              655,96 <span className="text-xs font-medium" style={{ color: '#475569' }}>XOF/EUR</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-12" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-[500px]">

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

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                  {t('firstName')}
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={set('firstName')}
                  required
                  autoComplete="given-name"
                  placeholder="Kossi"
                  className={inputClass}
                  style={{ color: '#0f172a' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                  {t('lastName')}
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={set('lastName')}
                  required
                  autoComplete="family-name"
                  placeholder="Agbeko"
                  className={inputClass}
                  style={{ color: '#0f172a' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                {t('email')}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
                placeholder="vous@email.com"
                className={inputClass}
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
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
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
              <p className="text-[12px] mt-1.5" style={{ color: '#94a3b8' }}>{t('passwordHint')}</p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
                  style={{ color: '#0f172a' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px]"
                  style={{ color: '#94a3b8' }}
                >
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-[12px] mt-1.5" style={{ color: '#ef4444' }}>{t('passwordMismatch')}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                {t('phone')}
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={set('phoneNumber')}
                required
                autoComplete="tel"
                placeholder="+1 514 000 0000"
                className={inputClass}
                style={{ color: '#0f172a' }}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                {t('country')}
              </label>
              <div ref={countryRef} className="relative">
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setCountryOpen(v => !v)}
                  className={`${inputClass} flex items-center gap-2.5 text-left`}
                  style={{ color: '#0f172a' }}
                >
                  {(() => {
                    const sel = countries?.find(c => c.code === form.country)
                    return sel ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={flagUrl(sel.code)} alt="" loading="eager" style={{ width: 20, height: 14, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} />
                        <span className="flex-1 truncate">{locale === 'fr' ? sel.nameFr : sel.name} <span style={{ color: '#64748b' }}>({sel.currencyCode})</span></span>
                      </>
                    ) : <span style={{ color: '#94a3b8' }}>—</span>
                  })()}
                  <svg className="w-4 h-4 shrink-0 ml-auto" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={countryOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                  </svg>
                </button>

                {/* Dropdown list — toujours dans le DOM pour pré-charger les images */}
                <div
                  className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#e2e8f0] rounded-[10px] shadow-lg overflow-y-auto"
                  style={{ maxHeight: '220px', display: countryOpen ? 'block' : 'none' }}
                >
                  {countries?.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setForm(prev => ({ ...prev, country: c.code })); setCountryOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#f1f5f9]"
                      style={{ background: c.code === form.country ? '#f0fdfa' : undefined, color: '#0f172a' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={flagUrl(c.code)}
                        alt=""
                        loading="eager"
                        style={{ width: 20, height: 14, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                      />
                      <span className="flex-1 truncate">{locale === 'fr' ? c.nameFr : c.name} <span style={{ color: '#94a3b8' }}>({c.currencyCode})</span></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp (optional) */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>
                {t('whatsapp')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base leading-none">
                  💬
                </span>
                <input
                  type="tel"
                  value={form.whatsAppNumber}
                  onChange={set('whatsAppNumber')}
                  autoComplete="tel"
                  placeholder="+1 514 000 0000"
                  className={`${inputClass} pl-10`}
                  style={{ color: '#0f172a' }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="text-sm rounded-lg p-3 border"
                style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}
              >
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
                ? (locale === 'fr' ? 'Création du compte…' : 'Creating account…')
                : t('submit')}
            </button>

            <p className="text-center text-[13px]" style={{ color: '#64748b' }}>
              {t('hasAccount')}{' '}
              <Link
                href={`/${locale}/auth/connexion`}
                className="font-bold hover:underline"
                style={{ color: '#0d9488' }}
              >
                {t('login')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
