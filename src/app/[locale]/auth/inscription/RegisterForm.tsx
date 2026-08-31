'use client'

import { useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { CircleCheck, ChevronDown, Eye, EyeOff, MessageCircle } from 'lucide-react'
import { registerAction, type AuthFormState } from '@/app/actions/auth'
import { flagUrl } from '@/lib/utils'
import type { CountryDto } from '@/types/api'

const initialState: AuthFormState = {}

export default function RegisterForm({ countries }: { countries: CountryDto[] }) {
  const t = useTranslations('auth.register')
  const tHome = useTranslations('home')
  const locale = useLocale()
  const [state, formAction, isPending] = useActionState(registerAction, initialState)

  const [showPassword, setShowPassword] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [country, setCountry] = useState('')
  const countryRef = useRef<HTMLDivElement>(null)

  const trustPoints = [
    tHome('hero.trust1'),
    tHome('hero.trust2'),
    tHome('hero.trust3'),
  ]

  const inputClass = 'input !py-3 !rounded-xl !px-4'

  return (
    <div className="flex min-h-[calc(100vh-68px)]">

      {/* ── Left panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between w-[440px] shrink-0 px-10 py-12 bg-[#0a1120] border-r border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-grid mask-fade-radial opacity-70" />
        <div className="aurora-orb -top-24 -left-24 w-[380px] h-[380px] bg-primary/20 animate-aurora" />

        <div className="relative">
          <Link href={`/${locale}`} className="inline-flex items-center">
            <span className="text-[21px] font-extrabold tracking-tight">
              <span className="text-primary-bright">Simplex</span><span className="text-white">Pay</span>
            </span>
          </Link>
        </div>

        <div className="relative">
          <p className="inline-block text-[11px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 rounded-full mb-5 bg-primary-light border border-primary-bright/20 text-primary-bright">
            {tHome('hero.badge')}
          </p>
          <h2 className="text-[28px] font-extrabold leading-[1.15] text-white mb-4">
            {tHome('hero.title')}
          </h2>
          <p className="text-[15px] leading-relaxed mb-8 text-slate-400">
            {tHome('hero.subtitle')}
          </p>
          <div className="flex flex-col gap-3">
            {trustPoints.map((pt, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CircleCheck className="w-5 h-5 text-primary-bright shrink-0" />
                <span className="text-sm font-medium text-slate-300">{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini demo card */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="hairline-top" />
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl('fr')} alt="FR" className="w-[18px] h-[13px] rounded-sm object-cover ring-1 ring-white/20" />
                <span>EUR</span>
                <span className="text-slate-600">→</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl('sn')} alt="SN" className="w-[18px] h-[13px] rounded-sm object-cover ring-1 ring-white/20" />
                <span>XOF</span>
              </div>
              <span className="badge-active !px-2 !py-0.5 !text-[10px]">Active</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.07em] mb-0.5 text-slate-500">Taux</p>
            <p className="text-[22px] font-extrabold text-primary-bright">
              655,96 <span className="text-xs font-medium text-slate-500">XOF/EUR</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="relative flex-1 flex items-start justify-center px-6 py-12 overflow-hidden">
        <div className="aurora-orb -top-32 -right-32 w-[420px] h-[420px] bg-primary/15" />
        <div className="relative w-full max-w-[500px]">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <span className="text-[21px] font-extrabold tracking-tight">
              <span className="text-primary">Simplex</span><span className="text-foreground">Pay</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-extrabold tracking-[-0.01em] text-foreground">
              {t('title')}
            </h1>
            <p className="text-[15px] mt-1.5 text-muted-foreground">{t('subtitle')}</p>
          </div>

          <form action={formAction} className="card !bg-white/[0.04] backdrop-blur-xl p-8 space-y-5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="country" value={country} />

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-foreground">
                  {t('firstName')}
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  placeholder="Kossi"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-foreground">
                  {t('lastName')}
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  placeholder="Agbeko"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground">
                {t('email')}
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="vous@email.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputClass} !pr-12`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              <p className="text-[12px] mt-1.5 text-muted-foreground">{t('passwordHint')}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground">
                {t('phone')}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                required
                autoComplete="tel"
                placeholder="+1 514 000 0000"
                className={inputClass}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground">
                {t('country')}
              </label>
              <div ref={countryRef} className="relative">
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setCountryOpen(v => !v)}
                  className={`${inputClass} flex items-center gap-2.5 text-left`}
                >
                  {(() => {
                    const sel = countries.find(c => c.code === country)
                    return sel ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={flagUrl(sel.code)} alt="" loading="eager" style={{ width: 20, height: 14, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} />
                        <span className="flex-1 truncate">{locale === 'fr' ? sel.nameFr : sel.name} <span className="text-muted-foreground">({sel.currencyCode})</span></span>
                      </>
                    ) : <span className="text-muted-foreground">—</span>
                  })()}
                  <ChevronDown className={`w-4 h-4 shrink-0 ml-auto text-muted-foreground transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown list — toujours dans le DOM pour pré-charger les images */}
                <div
                  className="absolute z-50 left-0 right-0 mt-1.5 glass-strong border border-white/10 rounded-xl shadow-pop overflow-y-auto"
                  style={{ maxHeight: '220px', display: countryOpen ? 'block' : 'none' }}
                >
                  {countries.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCountry(c.code); setCountryOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                        c.code === country ? 'bg-primary-light text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={flagUrl(c.code)}
                        alt=""
                        loading="eager"
                        style={{ width: 20, height: 14, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                      />
                      <span className="flex-1 truncate">{locale === 'fr' ? c.nameFr : c.name} <span className="text-muted-foreground">({c.currencyCode})</span></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp (optional) */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground">
                {t('whatsapp')}
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="tel"
                  name="whatsAppNumber"
                  autoComplete="tel"
                  placeholder="+1 514 000 0000"
                  className={`${inputClass} !pl-10`}
                />
              </div>
            </div>

            {/* Error */}
            {state.error && (
              <div className="text-sm rounded-lg p-3 border border-destructive/30 bg-destructive/10 text-destructive">
                {state.error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full !py-3 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isPending
                ? (locale === 'fr' ? 'Création du compte…' : 'Creating account…')
                : t('submit')}
            </button>

            <p className="text-center text-[13px] text-muted-foreground">
              {t('hasAccount')}{' '}
              <Link
                href={`/${locale}/auth/connexion`}
                className="font-bold hover:underline underline-offset-2 text-primary"
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
