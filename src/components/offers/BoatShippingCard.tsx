'use client'

import { useTranslations } from 'next-intl'
import { Lock, Phone } from 'lucide-react'
import { flagUrl, formatDate } from '@/lib/utils'
import OfferCardShell from './OfferCardShell'
import type { BoatShippingOfferDto } from '@/types/api'

interface Props {
  offer: BoatShippingOfferDto
  isAuthenticated: boolean
  locale: string
}

export default function BoatShippingCard({ offer, isAuthenticated, locale }: Props) {
  const t = useTranslations('home.boatShipping')

  return (
    <OfferCardShell
      route={
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(offer.departureCountryCode)} alt="" className="w-[22px] h-4 rounded-sm object-cover shrink-0" />
          <span className="truncate">{offer.departurePort}</span>
          <span className="text-muted-foreground/50 shrink-0">→</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(offer.destinationCountryCode)} alt="" className="w-[22px] h-4 rounded-sm object-cover shrink-0" />
          <span className="truncate">{offer.destinationPort}</span>
        </>
      }
      metricLabel={t('cardDate')}
      metricValue={formatDate(offer.shipDepartureDate, locale)}
      meta={[
        { label: t('cardLbs'), value: `${offer.availableLbs.toLocaleString()} lbs` },
        { label: t('cardPrice'), value: `${offer.pricePerLb.toLocaleString()} / lb` },
      ]}
      notes={offer.notes || null}
      creatorName={offer.creatorFirstName}
      creatorRating={offer.creatorRating}
      footerRight={
        isAuthenticated ? (
          <span className="flex items-center gap-1 text-xs font-bold text-primary">
            <Phone className="w-3 h-3" />
            {offer.creatorPhone}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Lock className="w-3 h-3" />
            {t('loginToContact')}
          </span>
        )
      }
    />
  )
}
