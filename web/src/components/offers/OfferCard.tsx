'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { flagUrl } from '@/lib/utils'
import { useDisplayRate } from '@/lib/useDailyRate'
import type { OfferDto } from '@/types/api'

interface Props {
  offer: OfferDto
  isAuthenticated: boolean
  locale: string
}

export default function OfferCard({ offer, isAuthenticated, locale }: Props) {
  const t = useTranslations('offers.card')
  const activeLocale = useLocale()
  const { value: rateValue, sourceLabel, isLoading: rateLoading } = useDisplayRate(
    offer.rateMode,
    offer.rate,
    offer.sellCurrency,
    offer.buyCurrency
  )

  const fromMethods = offer.paymentMethods.filter(pm => pm.side === 'From')
  const toMethods = offer.paymentMethods.filter(pm => pm.side === 'To')
  const allMethods = [...fromMethods, ...toMethods].slice(0, 3)

  const sourceBadge =
    sourceLabel === 'Fixed'
      ? null
      : sourceLabel === 'Google'
        ? (activeLocale === 'fr' ? 'Taux Google du jour' : 'Google daily rate')
        : (activeLocale === 'fr' ? 'Taux XE du jour' : 'XE daily rate')

  return (
    <Link
      href={`/${locale}/offres/${offer.id}`}
      className="block bg-white border rounded-2xl p-[22px] transition-all"
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
      {/* Header: currencies + status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 font-bold text-[15px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(offer.sellCountry)} alt={offer.sellCountry} className="w-[22px] h-4 rounded-sm object-cover shrink-0" />
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

      {/* Rate */}
      <p className="text-[11px] uppercase tracking-[0.06em] mb-1" style={{ color: '#64748b' }}>{t('rate')}</p>
      <p className="text-[26px] font-extrabold" style={{ color: '#0d9488' }}>
        {rateValue !== null
          ? <>
              {rateValue.toLocaleString(activeLocale, { maximumFractionDigits: 2 })}{' '}
              <span className="text-[13px] font-medium" style={{ color: '#64748b' }}>
                {offer.sellCurrencySymbol}/{offer.buyCurrencySymbol}
              </span>
            </>
          : rateLoading
            ? <span className="text-[15px] font-medium" style={{ color: '#94a3b8' }}>…</span>
            : <span className="text-[15px] font-medium" style={{ color: '#94a3b8' }}>—</span>
        }
      </p>
      {sourceBadge && (
        <p className="text-[11px] font-semibold mb-4" style={{ color: '#0d9488' }}>{sourceBadge}</p>
      )}
      {!sourceBadge && <div className="mb-4" />}

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
          <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: '#0d9488' }}>
            {offer.creator.firstName[0]}
          </div>
          <span className="text-[13px] font-semibold">{offer.creator.firstName}</span>
          {offer.creator.rating > 0 && (
            <span className="text-xs" style={{ color: '#64748b' }}>★ {offer.creator.rating.toFixed(1)}</span>
          )}
        </div>
        {isAuthenticated ? (
          <span className="text-xs font-bold" style={{ color: '#0d9488' }}>{t('contact')}</span>
        ) : (
          <span className="text-xs" style={{ color: '#64748b' }}>🔒</span>
        )}
      </div>
    </Link>
  )
}
