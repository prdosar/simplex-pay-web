'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    router.push(`/${locale}`)
  }

  const otherLocale = locale === 'fr' ? 'en' : 'fr'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[--color-border]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-0.5">
            <span className="text-[22px] font-extrabold" style={{ color: '#0d9488' }}>Simplex</span>
            <span className="text-[22px] font-extrabold" style={{ color: '#0f172a' }}>Pay</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}#offres`} className="text-sm font-semibold text-[#334155] hover:text-[--color-primary] transition-colors">
              {t('offers')}
            </Link>
            <Link href={`/${locale}#comment-ca-marche`} className="text-sm font-semibold text-[#334155] hover:text-[--color-primary] transition-colors">
              {t('howItWorks')}
            </Link>
            {isAuthenticated && (
              <Link href={`/${locale}/creer-offre`} className="text-sm font-semibold text-[#334155] hover:text-[--color-primary] transition-colors">
                {t('createOffer')}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <Link
              href={`/${otherLocale}`}
              className="text-xs font-semibold px-2.5 py-[5px] rounded-md border border-[--color-border] text-[--color-muted-foreground] hover:border-[--color-primary] hover:text-[--color-primary] transition-colors uppercase tracking-wider"
            >
              {otherLocale}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Link
                  href={`/${locale}/mon-compte`}
                  className="text-sm font-medium text-[--color-foreground] hover:text-[--color-primary]"
                >
                  {user?.firstName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[--color-muted-foreground] hover:text-[--color-destructive] transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/auth/connexion`}
                  className="text-sm font-medium text-[--color-foreground] hover:text-[--color-primary] px-3 py-1.5"
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/auth/inscription`}
                  className="text-sm font-bold bg-[--color-primary] text-white px-[18px] py-[9px] rounded-[10px] hover:bg-[--color-primary-dark] transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[--color-muted-foreground]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[--color-border] bg-white px-4 py-4 flex flex-col gap-3">
          <Link href={`/${locale}`} className="text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
            {t('offers')}
          </Link>
          {isAuthenticated ? (
            <>
              <Link href={`/${locale}/creer-offre`} className="text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
                {t('createOffer')}
              </Link>
              <Link href={`/${locale}/mon-compte`} className="text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
                {t('myAccount')}
              </Link>
              <button onClick={handleLogout} className="text-sm text-left text-[--color-destructive] py-2">
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/connexion`} className="text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
                {t('login')}
              </Link>
              <Link href={`/${locale}/auth/inscription`} className="text-sm font-semibold text-[--color-primary] py-2" onClick={() => setMenuOpen(false)}>
                {t('register')}
              </Link>
            </>
          )}
          <div className="pt-2 border-t border-[--color-border]">
            <Link href={`/${otherLocale}`} className="text-xs uppercase font-medium text-[--color-muted-foreground]">
              {otherLocale === 'fr' ? 'Français' : 'English'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
