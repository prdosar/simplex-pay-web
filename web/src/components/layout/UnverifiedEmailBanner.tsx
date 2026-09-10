'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'

export default function UnverifiedEmailBanner() {
  const t = useTranslations('auth.verify')
  const locale = useLocale()
  const { user, isAuthenticated } = useAuth()
  const pathname = usePathname()

  if (!isAuthenticated || !user || user.emailVerified) return null
  if (pathname?.includes('/auth/verifier-email')) return null

  return (
    <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <span style={{ color: '#92400e' }} className="text-sm font-medium flex-1 min-w-0">
          ⚠️ {t('unverifiedBanner')}
        </span>
        <Link
          href={`/${locale}/auth/verifier-email?email=${encodeURIComponent(user.email)}`}
          className="text-sm font-bold px-3 py-1.5 rounded-md transition-colors"
          style={{ color: '#0f172a', background: '#fbbf24' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fbbf24' }}
        >
          {t('unverifiedBannerCta')} →
        </Link>
      </div>
    </div>
  )
}
