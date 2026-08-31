'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Globe } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()
  const otherLocale = locale === 'fr' ? 'en' : 'fr'

  const columns = [
    {
      title: t('product'),
      links: [
        { label: t('seeOffers'), href: `/${locale}#offres` },
        { label: t('postOffer'), href: `/${locale}/creer-offre` },
        { label: t('howItWorks'), href: `/${locale}#comment-ca-marche` },
      ],
    },
    {
      title: t('account'),
      links: [
        { label: t('login'), href: `/${locale}/auth/connexion` },
        { label: t('register'), href: `/${locale}/auth/inscription` },
        { label: t('myAccount'), href: `/${locale}/mon-compte` },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('terms'), href: '#' },
        { label: t('privacy'), href: '#' },
        { label: t('tos'), href: '#' },
      ],
    },
  ]

  return (
    <footer className="relative bg-[#05080f] text-slate-400 pt-16 pb-8 px-5 sm:px-6 overflow-hidden border-t border-white/[0.06]">
      <div className="hairline-top absolute top-0 left-0 right-0" />
      <div className="aurora-orb -bottom-48 left-1/2 -translate-x-1/2 w-[720px] h-[300px] bg-primary/15" />

      <div className="container-page relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-14 lg:[grid-template-columns:1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center mb-4">
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-primary-bright">Simplex</span><span className="text-white">Pay</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-[280px] text-slate-500">
              {t('tagline')}
            </p>
          </div>

          {columns.map(col => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-[0.08em] mb-4 text-slate-500">{col.title}</p>
              <div className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-primary-bright transition-colors w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-6 border-t border-white/[0.06]">
          <p className="text-sm text-slate-600">{t('copyright')}</p>
          <Link
            href={`/${otherLocale}`}
            className="flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-500 hover:text-primary-bright hover:border-primary-bright/40 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {otherLocale}
          </Link>
        </div>
      </div>
    </footer>
  )
}
