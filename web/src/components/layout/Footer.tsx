'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()
  const otherLocale = locale === 'fr' ? 'en' : 'fr'

  return (
    <footer style={{ background: '#0f172a', color: '#cbd5e1' }} className="pt-16 pb-8 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 lg:[grid-template-columns:1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-0.5 text-xl font-extrabold mb-3">
              <span style={{ color: '#0d9488' }}>Simplex</span>
              <span className="text-white">Pay</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: '#64748b' }}>
              {t('tagline')}
            </p>
          </div>

          {/* Produit */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.06em] mb-4" style={{ color: '#64748b' }}>{t('product')}</p>
            <div className="flex flex-col gap-2.5">
              <Link href={`/${locale}#offres`} className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('seeOffers')}</Link>
              <Link href={`/${locale}/creer-offre`} className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('postOffer')}</Link>
              <Link href={`/${locale}#comment-ca-marche`} className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('howItWorks')}</Link>
            </div>
          </div>

          {/* Compte */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.06em] mb-4" style={{ color: '#64748b' }}>{t('account')}</p>
            <div className="flex flex-col gap-2.5">
              <Link href={`/${locale}/auth/connexion`} className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('login')}</Link>
              <Link href={`/${locale}/auth/inscription`} className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('register')}</Link>
              <Link href={`/${locale}/mon-compte`} className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('myAccount')}</Link>
            </div>
          </div>

          {/* Légal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.06em] mb-4" style={{ color: '#64748b' }}>{t('legal')}</p>
            <div className="flex flex-col gap-2.5">
              <Link href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('terms')}</Link>
              <Link href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('privacy')}</Link>
              <Link href="#" className="text-sm hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{t('tos')}</Link>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-6" style={{ borderTop: '1px solid #1e293b' }}>
          <p className="text-sm" style={{ color: '#64748b' }}>{t('copyright')}</p>
          <Link
            href={`/${otherLocale}`}
            className="text-xs font-semibold uppercase px-2.5 py-1.5 rounded-md border transition-colors hover:text-white"
            style={{ color: '#64748b', borderColor: '#1e293b' }}
          >
            {otherLocale}
          </Link>
        </div>
      </div>
    </footer>
  )
}
