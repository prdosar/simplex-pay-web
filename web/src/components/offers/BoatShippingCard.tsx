'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { flagUrl } from '@/lib/utils'
import CreatorTrustBadges from './CreatorTrustBadges'
import type { BoatShippingOfferDto } from '@/types/api'

interface Props {
  offer: BoatShippingOfferDto
  isAuthenticated: boolean
  locale: string
}

export default function BoatShippingCard({ offer, isAuthenticated, locale }: Props) {
  const t = useTranslations('home.boatShipping')
  const router = useRouter()

  const dateStr = new Date(offer.shipDepartureDate).toLocaleDateString(
    locale === 'fr' ? 'fr' : 'en',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/${locale}/fret/${offer.id}`)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/${locale}/fret/${offer.id}`) } }}
      className="bg-white border rounded-2xl p-[22px] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
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
      {/* Header: departure port → destination port */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 font-bold text-[15px] min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(offer.departureCountryCode)} alt="" style={{ width: 22, height: 16 }} className="rounded-sm object-cover shrink-0" />
          <span className="truncate">{offer.departurePort}</span>
          <span style={{ color: '#94a3b8' }} className="shrink-0">→</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(offer.destinationCountryCode)} alt="" style={{ width: 22, height: 16 }} className="rounded-sm object-cover shrink-0" />
          <span className="truncate">{offer.destinationPort}</span>
        </div>
        <span className="text-[11px] font-semibold px-[9px] py-[3px] rounded-full shrink-0 ml-2" style={{ color: '#0d9488', background: '#ccfbf1' }}>
          Active
        </span>
      </div>

      {/* Date */}
      <p className="text-[11px] uppercase tracking-[0.06em] mb-1" style={{ color: '#64748b' }}>{t('cardDate')}</p>
      <p className="text-[22px] font-extrabold mb-4" style={{ color: '#0d9488' }}>{dateStr}</p>

      {/* Lbs + Price */}
      <div className="grid grid-cols-2 gap-[10px] mb-4 text-[13px]">
        <div>
          <p className="mb-0.5" style={{ color: '#64748b' }}>{t('cardLbs')}</p>
          <p className="font-bold">{offer.availableLbs.toLocaleString()} lbs</p>
        </div>
        <div>
          <p className="mb-0.5" style={{ color: '#64748b' }}>{t('cardPrice')}</p>
          <p className="font-bold">{offer.pricePerLb.toLocaleString()} / lb</p>
        </div>
      </div>

      {/* Notes */}
      {offer.notes && (
        <p className="text-[12px] mb-3 line-clamp-2" style={{ color: '#64748b' }}>{offer.notes}</p>
      )}

      {/* Creator */}
      <div className="flex items-center justify-between pt-3.5" style={{ borderTop: '1px solid #f1f5f9' }}>
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#0d9488' }}>
            {offer.creatorFirstName[0]}
          </div>
          <CreatorTrustBadges
            userId={offer.creatorId}
            firstName={offer.creatorFirstName}
            isCertified={offer.creatorIsCertified}
            rating={offer.creatorRating}
            reviewCount={offer.creatorReviewCount}
            locale={locale}
            linkable={false}
          />
        </div>
        {isAuthenticated ? (
          <span className="text-xs font-bold" style={{ color: '#0d9488' }}>{offer.creatorPhone}</span>
        ) : (
          <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{t('loginToContact')}</span>
        )}
      </div>
    </div>
  )
}
