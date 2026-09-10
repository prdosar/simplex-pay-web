'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'
import type { OfferDto, PagedResult } from '@/types/api'

function statusColor(status: string) {
  if (status === 'Open') return 'bg-green-100 text-green-700'
  if (status === 'Cancelled') return 'bg-red-100 text-red-700'
  if (status === 'Filled') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-600'
}

export default function AccountPage() {
  const t = useTranslations('account')
  const locale = useLocale()
  const { user, isAuthenticated } = useAuth()

  const { data: myOffers, isLoading } = useSWR<PagedResult<OfferDto>>(
    isAuthenticated ? '/api/offers/me?pageSize=10' : null,
    (url: string) => api.get<PagedResult<OfferDto>>(url)
  )

  if (!isAuthenticated) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-lg mb-4">{locale === 'fr' ? 'Connectez-vous pour voir votre compte.' : 'Log in to view your account.'}</p>
      <Link href={`/${locale}/auth/connexion`} className="px-6 py-2.5 bg-[--color-primary] text-white rounded-lg font-medium">
        {locale === 'fr' ? 'Se connecter' : 'Log in'}
      </Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="bg-white border border-[--color-border] rounded-2xl p-6 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[--color-primary] text-white text-2xl flex items-center justify-center font-bold">
          {user?.firstName[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h1>
          <p className="text-[--color-muted-foreground] text-sm">{user?.email}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">{user?.status}</span>
            <span className="text-xs text-[--color-muted-foreground]">
              {locale === 'fr' ? 'Pays' : 'Country'}: {user?.country}
            </span>
          </div>
        </div>
        <Link href={`/${locale}/creer-offre`}
          className="px-5 py-2.5 bg-[--color-primary] text-white font-semibold rounded-xl hover:bg-[--color-primary-dark] transition-colors text-sm">
          + {locale === 'fr' ? 'Nouvelle offre' : 'New offer'}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: locale === 'fr' ? 'Transactions' : 'Transactions', value: user?.transactionCount ?? 0 },
          { label: locale === 'fr' ? 'Note' : 'Rating', value: user?.rating ? `⭐ ${user.rating.toFixed(1)}` : '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-[--color-border] rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-[--color-primary]">{stat.value}</p>
            <p className="text-sm text-[--color-muted-foreground] mt-1">{stat.label}</p>
          </div>
        ))}
        <div className="bg-white border border-[--color-border] rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-[--color-primary]">🔒</p>
          <p className="text-sm text-[--color-muted-foreground] mt-1">{locale === 'fr' ? 'Téléphone vérifié' : 'Verified phone'}</p>
        </div>
      </div>

      {/* My offers */}
      <div className="bg-white border border-[--color-border] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{t('myOffers')}</h2>
          <Link href={`/${locale}/creer-offre`}
            className="text-sm px-4 py-2 border border-[--color-primary] text-[--color-primary] font-medium rounded-lg hover:bg-[--color-primary-light] transition-colors">
            {t('createFirst')}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : myOffers?.items.length === 0 ? (
          <p className="text-[--color-muted-foreground] text-sm py-4 text-center">
            {locale === 'fr'
              ? 'Vous n\'avez pas encore publié d\'offre.'
              : 'You haven\'t posted any offers yet.'}
          </p>
        ) : (
          <div className="divide-y divide-[--color-border]">
            {myOffers?.items.map(offer => (
              <div key={offer.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{offer.sellCountryFlag}</div>
                  <div>
                    <p className="font-semibold text-sm">
                      {offer.sellCurrency} → {offer.buyCurrency}
                    </p>
                    <p className="text-xs text-[--color-muted-foreground]">
                      {offer.rateMode === 'Fixed' && offer.rate !== null
                        ? offer.rate.toLocaleString()
                        : offer.rateMode === 'GoogleDaily'
                          ? (locale === 'fr' ? 'Taux Google' : 'Google rate')
                          : (locale === 'fr' ? 'Taux XE' : 'XE rate')
                      } · {offer.remainingAmount.toLocaleString()} {offer.sellCurrencySymbol} {locale === 'fr' ? 'restants' : 'remaining'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(offer.status)}`}>
                    {offer.status}
                  </span>
                  <Link href={`/${locale}/offres/${offer.id}`}
                    className="text-xs text-[--color-primary] hover:underline">
                    {locale === 'fr' ? 'Voir' : 'View'} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {myOffers && myOffers.totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-[--color-border] text-center">
            <Link href={`/${locale}/offres?userId=me`} className="text-sm text-[--color-primary] hover:underline">
              {locale === 'fr' ? `Voir toutes mes offres (${myOffers.total})` : `View all my offers (${myOffers.total})`}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
