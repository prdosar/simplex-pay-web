'use client'

import { useTranslations } from 'next-intl'
import { ArrowRight, Lock, Phone } from 'lucide-react'
import { flagUrl } from '@/lib/utils'
import OfferCardShell from './OfferCardShell'
import type { OfferDto } from '@/types/api'

interface Props {
  offer: OfferDto
  isAuthenticated: boolean
  locale: string
}

export default function OfferCard({ offer, isAuthenticated, locale }: Props) {
  const t = useTranslations('offers.card')

  const fromMethods = offer.paymentMethods.filter(pm => pm.side === 'From')
  const toMethods = offer.paymentMethods.filter(pm => pm.side === 'To')
  const allMethods = [...fromMethods, ...toMethods].slice(0, 3)

  return (
    <OfferCardShell
      href={`/${locale}/offres/${offer.id}`}
      route={
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(offer.sellCountry)} alt={offer.sellCountry} className="w-[22px] h-4 rounded-sm object-cover shrink-0" />
          <span>{offer.sellCurrency}</span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 transition-colors group-hover:text-primary" strokeWidth={2.5} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(offer.buyCountry)} alt={offer.buyCountry} className="w-[22px] h-4 rounded-sm object-cover shrink-0" />
          <span>{offer.buyCurrency}</span>
        </>
      }
      metricLabel={t('rate')}
      metricValue={
        <>
          {offer.rate.toLocaleString()}{' '}
          <span className="text-[13px] font-semibold text-muted-foreground">
            {offer.sellCurrencySymbol}/{offer.buyCurrencySymbol}
          </span>
        </>
      }
      meta={[
        { label: t('available'), value: `${offer.remainingAmount.toLocaleString()} ${offer.sellCurrencySymbol}` },
        { label: t('minMax'), value: `${offer.minAmount.toLocaleString()} – ${offer.maxAmount.toLocaleString()}` },
      ]}
      chips={
        allMethods.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {allMethods.map((pm, i) => (
              <span key={i} className="badge-chip">{pm.name}</span>
            ))}
          </div>
        ) : undefined
      }
      creatorName={offer.creator.firstName}
      creatorRating={offer.creator.rating}
      footerRight={
        isAuthenticated ? (
          <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:underline underline-offset-2">
            <Phone className="w-3 h-3" />
            {t('contact')}
          </span>
        ) : (
          <span className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-muted-foreground" title={t('loginToContact')}>
            <Lock className="w-3 h-3" />
          </span>
        )
      }
    />
  )
}
