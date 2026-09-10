'use client'

import { use } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { api } from '@/lib/api'
import { flagUrl } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useDisplayRate } from '@/lib/useDailyRate'
import type { OfferDto } from '@/types/api'

export default function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('offer')
  const locale = useLocale()
  const { isAuthenticated } = useAuth()

  const { data: offer, isLoading, error } = useSWR<OfferDto>(
    `/api/offers/${id}`,
    (url: string) => api.get<OfferDto>(url)
  )

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-48" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  )

  if (error || !offer) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-[--color-destructive]">Offre introuvable.</p>
      <Link href={`/${locale}/offres`} className="text-[--color-primary] mt-4 inline-block hover:underline">
        ← {t('back')}
      </Link>
    </div>
  )

  const fromMethods = offer.paymentMethods.filter(pm => pm.side === 'From')
  const toMethods = offer.paymentMethods.filter(pm => pm.side === 'To')

  const { value: rateValue, sourceLabel } = useDisplayRate(
    offer.rateMode,
    offer.rate,
    offer.sellCurrency,
    offer.buyCurrency
  )
  const rateSourceLabel =
    sourceLabel === 'Fixed'
      ? null
      : sourceLabel === 'Google'
        ? (locale === 'fr' ? 'Taux Google du jour' : 'Google daily rate')
        : (locale === 'fr' ? 'Taux XE du jour' : 'XE daily rate')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href={`/${locale}/offres`} className="text-sm text-[--color-muted-foreground] hover:text-[--color-primary] flex items-center gap-1 mb-6">
        ← {t('back')}
      </Link>

      <div className="bg-white border border-[--color-border] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[--color-primary] to-[--color-primary-dark] p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagUrl(offer.sellCountry)} alt={offer.sellCountry} className="w-14 h-10 rounded object-cover shrink-0 shadow" />
            <div>
              <p className="text-3xl font-bold">{offer.sellCurrency} → {offer.buyCurrency}</p>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl(offer.buyCountry)} alt={offer.buyCountry} className="w-5 h-3.5 rounded-sm object-cover" />
                {offer.buyCountry}
                <span>↔</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl(offer.sellCountry)} alt={offer.sellCountry} className="w-5 h-3.5 rounded-sm object-cover" />
                {offer.sellCountry}
              </p>
            </div>
          </div>
          <div className="text-4xl font-bold mt-4">
            {rateValue !== null
              ? rateValue.toLocaleString(locale, { maximumFractionDigits: 2 })
              : '—'
            }
            <span className="text-xl font-normal text-white/80 ml-2">
              {offer.sellCurrencySymbol}/{offer.buyCurrencySymbol}
            </span>
          </div>
          {rateSourceLabel && (
            <p className="text-sm text-white/80 mt-1">{rateSourceLabel}</p>
          )}
        </div>

        <div className="p-6">
          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[--color-border]">
            <div>
              <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-1">Disponible</p>
              <p className="text-xl font-bold">{offer.remainingAmount.toLocaleString()} <span className="text-sm text-[--color-muted-foreground]">{offer.sellCurrencySymbol}</span></p>
            </div>
            <div>
              <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-1">Min</p>
              <p className="text-xl font-bold">{offer.minAmount.toLocaleString()} <span className="text-sm text-[--color-muted-foreground]">{offer.sellCurrencySymbol}</span></p>
            </div>
          </div>

          {/* Equivalent — uniquement si on connaît le taux */}
          {rateValue !== null && rateValue > 0 && (
            <div className="bg-[--color-muted] rounded-xl p-4 mb-6">
              <p className="text-sm text-[--color-muted-foreground]">
                {t('buyEquivalent', { currency: offer.buyCurrency })}
              </p>
              <p className="text-2xl font-bold text-[--color-primary]">
                {offer.buyCurrencySymbol} {(offer.amount / rateValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Payment methods */}
          {(fromMethods.length > 0 || toMethods.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[--color-border]">
              {fromMethods.length > 0 && (
                <div>
                  <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-2">{t('paymentFrom')}</p>
                  <div className="flex flex-wrap gap-2">
                    {fromMethods.map((pm, i) => (
                      <span key={i} className="text-sm px-3 py-1 bg-[--color-primary-light] text-[--color-primary] rounded-full font-medium">
                        {pm.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {toMethods.length > 0 && (
                <div>
                  <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-2">{t('paymentTo')}</p>
                  <div className="flex flex-wrap gap-2">
                    {toMethods.map((pm, i) => (
                      <span key={i} className="text-sm px-3 py-1 bg-[--color-muted] text-[--color-foreground] rounded-full">
                        {pm.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {offer.notes && (
            <div className="mb-6 pb-6 border-b border-[--color-border]">
              <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-2">{t('notes')}</p>
              <p className="text-sm bg-[--color-muted] rounded-lg p-3">{offer.notes}</p>
            </div>
          )}

          {/* Seller + contact */}
          <div>
            <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-3">{t('creator')}</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[--color-primary] text-white text-lg flex items-center justify-center font-bold">
                {offer.creator.firstName[0]}
              </div>
              <div>
                <p className="font-semibold">
                  {offer.creator.firstName} {offer.creator.lastName ?? ''}
                </p>
                <p className="text-sm text-[--color-muted-foreground]">
                  {offer.creator.transactionCount} {t('transactions')}
                  {offer.creator.rating > 0 && ` · ⭐ ${offer.creator.rating.toFixed(1)}`}
                </p>
              </div>
            </div>

            {/* Contact info */}
            {isAuthenticated ? (
              <div className="bg-[--color-muted] rounded-xl p-4 space-y-2">
                <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-3">{t('contactInfo')}</p>
                {offer.creator.phone && (
                  <a href={`tel:${offer.creator.phone}`} className="flex items-center gap-2 text-[--color-foreground] hover:text-[--color-primary] font-medium">
                    📞 {offer.creator.phone}
                  </a>
                )}
                {offer.creator.whatsApp && (
                  <a href={`https://wa.me/${offer.creator.whatsApp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[--color-success] hover:underline font-medium">
                    💬 WhatsApp: {offer.creator.whatsApp}
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-[--color-muted] rounded-xl p-5 text-center">
                <p className="text-[--color-muted-foreground] mb-4">🔒 {t('loginRequired')}</p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href={`/${locale}/auth/inscription`}
                    className="px-5 py-2.5 bg-[--color-primary] text-white font-semibold rounded-lg hover:bg-[--color-primary-dark] transition-colors"
                  >
                    {locale === 'fr' ? "S'inscrire" : 'Sign up'}
                  </Link>
                  <Link
                    href={`/${locale}/auth/connexion`}
                    className="px-5 py-2.5 border border-[--color-border] text-[--color-foreground] rounded-lg hover:border-[--color-primary] transition-colors"
                  >
                    {locale === 'fr' ? 'Se connecter' : 'Log in'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
