'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'
import { loginAction, type AuthFormState } from '@/app/actions/auth'

const initialState: AuthFormState = {}

export default function LoginPage() {
  const t = useTranslations('auth.login')
  const locale = useLocale()
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="relative flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden px-5 py-12">
      {/* Décors */}
      <div className="absolute inset-0 bg-grid mask-fade-radial opacity-70" />
      <div className="aurora-orb -top-32 -left-32 w-[420px] h-[420px] bg-primary/15 animate-aurora" />
      <div className="aurora-orb -bottom-40 -right-24 w-[380px] h-[380px] bg-primary/10" />

      <div className="relative w-full max-w-[420px] animate-fade-up">
        {/* Titre */}
        <div className="mb-7 text-center">
          <h1 className="text-[28px] font-extrabold tracking-[-0.01em] text-foreground">
            {t('title')}
          </h1>
          <p className="text-[15px] mt-1.5 text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Carte formulaire */}
        <form action={formAction} className="card p-7 sm:p-8 space-y-5">
          <input type="hidden" name="locale" value={locale} />

          {/* Email */}
          <div>
            <label htmlFor="login-email" className="field-label">
              {t('email')}
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="vous@email.com"
              className="input !py-3 !rounded-xl !px-4"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="login-password" className="field-label">
              {t('password')}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                autoComplete="current-password"
                className="input !py-3 !rounded-xl !px-4 !pr-12"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {state.error && (
            <div role="alert" className="text-sm rounded-lg p-3 border border-destructive/30 bg-destructive/10 text-destructive">
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
              ? (locale === 'fr' ? 'Connexion…' : 'Logging in…')
              : t('submit')}
          </button>

          <p className="text-center text-[13px] text-muted-foreground">
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/auth/inscription`}
              className="font-bold hover:underline underline-offset-2 text-primary"
            >
              {t('register')}
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
