'use client'

import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { flagUrl } from '@/lib/utils'
import CreatorTrustBadges from './CreatorTrustBadges'
import type { OfferDto } from '@/types/api'

interface Props {
  offer: OfferDto
  isAuthenticated: boolean
  locale: string
}

export default function OfferCard({ offer, isAuthenticated, locale }: Props) {
  const t = useTranslations('offers.card')
  const activeLocale = useLocale()
  const router = useRouter()

  const fromMethods = offer.paymentMethods.filter(pm => pm.side === 'From')
  const toMethods = offer.paymentMethods.filter(pm => pm.side === 'To')
  const allMethods = [...fromMethods, ...toMethods].slice(0, 3)

  const dailyLabel =
    offer.rateMode === 'GoogleDaily'
      ? (activeLocale === 'fr' ? 'Taux Google du jour' : 'Google daily rate')
      : offer.rateMode === 'XeDaily'
        ? (activeLocale === 'fr' ? 'Taux XE du jour' : 'XE daily rate')
        : null

  // Div cliquable (au lieu d'un <Link>) pour permettre le lien "profil" imbriqué sans nested <a>.
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/${locale}/offres/${offer.id}`)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/${locale}/offres/${offer.id}`) } }}
      className="block bg-white border rounded-2xl p-[22px] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
      style={{ borderColor: '#e2e8f0' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#0d9488'
        e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(13,148,136,0.2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Header: currencies + status. Empile les drapeaux vendeurs (UEMOA/CEMAC = plusieurs pays). */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 font-bold text-[15px]">
          <span className="flex items-center -space-x-1.5">
            {offer.sellCountries.slice(0, 3).map(code => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={code} src={flagUrl(code)} alt={code}
                className="w-[22px] h-4 rounded-sm object-cover ring-1 ring-white" />
            ))}
            {offer.sellCountries.length > 3 && (
              <span className="pl-2 text-[11px] font-medium" style={{ color: '#64748b' }}>
                +{offer.sellCountries.length - 3}
              </span>
            )}
          </span>
          <span>{offer.sellCurrency}</span>
          <span style={{ color: '#94a3b8' }}>→</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(offer.buyCountry)} alt={offer.buyCountry} className="w-[22px] h-4 rounded-sm object-cover shrink-0" />
          <span>{offer.buyCurrency}</span>
        </div>
        <span className="text-[11px] font-semibold px-[9px] py-[3px] rounded-full" style={{ color: '#0d9488', background: '#ccfbf1' }}>
          Active
        </span>
      </div>

      {/* Rate — afficher l'offre TELLE QUE le vendeur l'a saisie.
          Fixed → valeur numérique. Google/XE → juste le label (jamais de conversion). */}
      <p className="text-[11px] uppercase tracking-[0.06em] mb-1" style={{ color: '#64748b' }}>{t('rate')}</p>
      {offer.rateMode === 'Fixed' ? (
        <p className="text-[26px] font-extrabold mb-4" style={{ color: '#0d9488' }}>
          {offer.rate !== null
            ? <>
                {offer.rate.toLocaleString(activeLocale, { maximumFractionDigits: 2 })}{' '}
                <span className="text-[13px] font-medium" style={{ color: '#64748b' }}>
                  {offer.sellCurrencySymbol}/{offer.buyCurrencySymbol}
                </span>
              </>
            : <span className="text-[15px] font-medium" style={{ color: '#94a3b8' }}>—</span>
          }
        </p>
      ) : (
        <p className="text-[18px] font-extrabold mb-4" style={{ color: '#0d9488' }}>{dailyLabel}</p>
      )}

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-[10px] mb-4 text-[13px]">
        <div>
          <p className="mb-0.5" style={{ color: '#64748b' }}>{t('available')}</p>
          <p className="font-bold">{offer.remainingAmount.toLocaleString()} {offer.sellCurrencySymbol}</p>
        </div>
        <div>
          <p className="mb-0.5" style={{ color: '#64748b' }}>{t('min')}</p>
          <p className="font-bold">{offer.minAmount.toLocaleString()} {offer.sellCurrencySymbol}</p>
        </div>
      </div>

      {/* Payment method chips */}
      {allMethods.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-[14px]">
          {allMethods.map((pm, i) => (
            <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>
              {pm.name}
            </span>
          ))}
        </div>
      )}

      {/* Seller + contact/lock */}
      <div className="flex items-center justify-between pt-3.5" style={{ borderTop: '1px solid #f1f5f9' }}>
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#0d9488' }}>
            {offer.creator.firstName[0]}
          </div>
          <CreatorTrustBadges
            userId={offer.creator.id}
            firstName={offer.creator.firstName}
            isCertified={offer.creator.isCertified}
            rating={offer.creator.rating}
            reviewCount={offer.creator.reviewCount}
            locale={locale}
          />
        </div>
        {isAuthenticated ? (
          <span className="text-xs font-bold" style={{ color: '#0d9488' }}>{t('contact')}</span>
        ) : (
          <span className="text-xs" style={{ color: '#64748b' }}>🔒</span>
        )}
      </div>
    </div>
  )
}
