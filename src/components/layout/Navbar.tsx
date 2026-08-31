'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { logoutAction } from '@/app/actions/auth'
import { useState } from 'react'
import { Menu, X, Globe, LayoutDashboard } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const { user, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const otherLocale = locale === 'fr' ? 'en' : 'fr'

  const links = [
    { href: `/${locale}#offres`, label: t('offers') },
    { href: `/${locale}#comment-ca-marche`, label: t('howItWorks') },
    ...(isAuthenticated ? [{ href: `/${locale}/creer-offre`, label: t('createOffer') }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/70">
      <div className="container-page">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link href={`/${locale}`} className="group flex items-center">
            <span className="text-[21px] font-extrabold tracking-tight">
              <span className="text-primary">Simplex</span><span className="text-foreground">Pay</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-muted-foreground hover:text-primary px-3.5 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href={`/${otherLocale}`}
              aria-label="Switch language"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-[7px] rounded-lg border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {otherLocale}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/mon-compte`}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary pl-1.5 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-deeper text-primary-foreground flex items-center justify-center text-[11px] font-extrabold">
                    {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  {user?.firstName}
                </Link>
                <form action={logoutAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-muted-foreground hover:text-destructive px-2 py-1.5 rounded-lg transition-colors"
                  >
                    {t('logout')}
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/auth/connexion`}
                  className="text-sm font-semibold text-foreground hover:text-primary px-3.5 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/auth/inscription`}
                  className="text-sm font-bold bg-gradient-to-b from-primary to-primary-deeper text-primary-foreground px-4 py-2 rounded-lg shadow-glow-teal hover:from-primary-dark hover:to-primary-deeper hover:-translate-y-px transition-all"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-strong border-t border-border/70 px-5 py-4 flex flex-col gap-1 shadow-pop">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-foreground py-2.5 px-3 rounded-lg hover:bg-muted hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href={`/${locale}/mon-compte`}
              className="flex items-center gap-2 text-sm font-semibold text-foreground py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              {t('myAccount')}
            </Link>
          )}
          <div className="pt-3 mt-2 border-t border-border/70 flex flex-col gap-2">
            {isAuthenticated ? (
              <form action={logoutAction} onSubmit={() => setMenuOpen(false)}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="w-full text-sm font-semibold text-destructive py-2.5 px-3 rounded-lg hover:bg-destructive/10 transition-colors text-left">
                  {t('logout')}
                </button>
              </form>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/connexion`}
                  className="text-sm font-semibold text-foreground py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/auth/inscription`}
                  className="btn-primary !py-2.5 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            )}
            <div className="flex items-center justify-between py-2 px-3">
              <Link
                href={`/${otherLocale}`}
                className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground"
                onClick={() => setMenuOpen(false)}
              >
                <Globe className="w-3.5 h-3.5" />
                {otherLocale === 'fr' ? 'Français' : 'English'}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
