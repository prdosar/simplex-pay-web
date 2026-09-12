'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { flagUrl } from '@/lib/utils'
import type { OfferDto, TravelKiloOfferDto, BoatShippingOfferDto, PagedResult } from '@/types/api'

type Tab = 'devises' | 'kilos' | 'bateau'

// Collapse 5 domain statuses → 3 user-facing: Active | Partiel | Clôturé.
function statusColor(status: string) {
  if (status === 'Open') return 'bg-green-100 text-green-700'
  if (status === 'PartiallyFilled') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600' // Filled / Cancelled / Expired → Clôturé
}

function localizedStatus(s: string, locale: string) {
  if (s === 'Open') return locale === 'fr' ? 'Active' : 'Active'
  if (s === 'PartiallyFilled') return locale === 'fr' ? 'Partiel' : 'Partial'
  return locale === 'fr' ? 'Clôturé' : 'Closed'
}

export default function AccountPage() {
  const locale = useLocale()
  const { user, isAuthenticated } = useAuth()
  const [tab, setTab] = useState<Tab>('devises')

  const { data: devises, isLoading: devisesLoading } = useSWR<PagedResult<OfferDto>>(
    isAuthenticated ? '/api/offers/me?pageSize=50' : null,
    (url: string) => api.get<PagedResult<OfferDto>>(url)
  )
  const { data: kilos, isLoading: kilosLoading } = useSWR<PagedResult<TravelKiloOfferDto>>(
    isAuthenticated ? '/api/travel-kilo/me?pageSize=50' : null,
    (url: string) => api.get<PagedResult<TravelKiloOfferDto>>(url)
  )
  const { data: bateau, isLoading: bateauLoading } = useSWR<PagedResult<BoatShippingOfferDto>>(
    isAuthenticated ? '/api/boat-shipping/me?pageSize=50' : null,
    (url: string) => api.get<PagedResult<BoatShippingOfferDto>>(url)
  )

  if (!isAuthenticated) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-lg mb-4">{locale === 'fr' ? 'Connectez-vous pour voir votre compte.' : 'Log in to view your account.'}</p>
      <Link href={`/${locale}/auth/connexion`} className="px-6 py-2.5 text-white rounded-lg font-medium" style={{ background: '#0d9488' }}>
        {locale === 'fr' ? 'Se connecter' : 'Log in'}
      </Link>
    </div>
  )

  const counts = {
    devises: devises?.total ?? 0,
    kilos: kilos?.total ?? 0,
    bateau: bateau?.total ?? 0,
  }
  const TABS: { key: Tab; label: string }[] = [
    { key: 'devises', label: locale === 'fr' ? `Devises (${counts.devises})` : `Currencies (${counts.devises})` },
    { key: 'kilos',   label: locale === 'fr' ? `Kilos (${counts.kilos})` : `Travel kilos (${counts.kilos})` },
    { key: 'bateau',  label: locale === 'fr' ? `Fret (${counts.bateau})` : `Sea freight (${counts.bateau})` },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="bg-white border rounded-2xl p-6 mb-8 flex items-center gap-5" style={{ borderColor: '#e2e8f0' }}>
        <div className="w-16 h-16 rounded-full text-white text-2xl flex items-center justify-center font-bold shrink-0" style={{ background: '#0d9488' }}>
          {user?.firstName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>{user?.email}</p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">{user?.status}</span>
            <span className="text-xs" style={{ color: '#64748b' }}>
              {locale === 'fr' ? 'Pays' : 'Country'}: {user?.country}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Link href={`/${locale}/creer-offre`}
            className="px-5 py-2.5 text-white font-semibold rounded-xl transition-colors text-sm text-center"
            style={{ background: '#0d9488' }}>
            + {locale === 'fr' ? 'Nouvelle offre' : 'New offer'}
          </Link>
          <Link href={`/${locale}/mon-compte/profil/modifier`}
            className="px-5 py-2 border font-semibold rounded-xl text-sm text-center transition-colors"
            style={{ borderColor: '#e2e8f0', color: '#0d9488' }}>
            {locale === 'fr' ? 'Modifier profil' : 'Edit profile'}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(tabItem => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === tabItem.key ? '#0d9488' : 'white',
              color: tab === tabItem.key ? 'white' : '#64748b',
              border: `1.5px solid ${tab === tabItem.key ? '#0d9488' : '#e2e8f0'}`,
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-2xl p-6" style={{ borderColor: '#e2e8f0' }}>
        {tab === 'devises' && (
          <DevisesList offers={devises?.items} isLoading={devisesLoading} locale={locale} />
        )}
        {tab === 'kilos' && (
          <KilosList offers={kilos?.items} isLoading={kilosLoading} locale={locale} />
        )}
        {tab === 'bateau' && (
          <FretList offers={bateau?.items} isLoading={bateauLoading} locale={locale} />
        )}
      </div>
    </div>
  )
}

function Skeletons() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  )
}

function EmptyMsg({ msg }: { msg: string }) {
  return <p className="text-sm py-4 text-center" style={{ color: '#94a3b8' }}>{msg}</p>
}

function DevisesList({ offers, isLoading, locale }: { offers?: OfferDto[]; isLoading: boolean; locale: string }) {
  if (isLoading) return <Skeletons />
  if (!offers?.length) return <EmptyMsg msg={locale === 'fr' ? "Aucune offre Devises." : 'No currency offers.'} />
  return (
    <div className="divide-y" style={{ borderColor: '#e2e8f0' }}>
      {offers.map(o => (
        <div key={o.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {/* Stack de drapeaux vendeurs (multi-pays UEMOA/CEMAC). */}
            <span className="flex items-center -space-x-2 shrink-0">
              {o.sellCountries.slice(0, 3).map(code => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={code} src={flagUrl(code)} alt=""
                  className="w-8 h-6 rounded-sm object-cover ring-2 ring-white" />
              ))}
              {o.sellCountries.length > 3 && (
                <span className="pl-2.5 text-xs font-medium" style={{ color: '#64748b' }}>
                  +{o.sellCountries.length - 3}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm">{o.sellCurrency} → {o.buyCurrency}</p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                {o.rateMode === 'Fixed' && o.rate !== null
                  ? `${o.rate.toLocaleString()} ${o.sellCurrencySymbol}/${o.buyCurrencySymbol}`
                  : o.rateMode === 'GoogleDaily'
                    ? (locale === 'fr' ? 'Taux Google' : 'Google rate')
                    : (locale === 'fr' ? 'Taux XE' : 'XE rate')}
                {' · '}
                {o.remainingAmount.toLocaleString()} / {o.amount.toLocaleString()} {o.sellCurrencySymbol} {locale === 'fr' ? 'restants' : 'remaining'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(o.status)}`}>
              {localizedStatus(o.status, locale)}
            </span>
            <Link href={`/${locale}/mon-compte/offres/${o.id}/modifier`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
              style={{ borderColor: '#0d9488', color: '#0d9488' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#ccfbf1')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {locale === 'fr' ? 'Modifier' : 'Edit'}
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

function KilosList({ offers, isLoading, locale }: { offers?: TravelKiloOfferDto[]; isLoading: boolean; locale: string }) {
  if (isLoading) return <Skeletons />
  if (!offers?.length) return <EmptyMsg msg={locale === 'fr' ? "Aucune offre Kilos voyage." : 'No travel kilo offers.'} />
  return (
    <div className="divide-y" style={{ borderColor: '#e2e8f0' }}>
      {offers.map(o => (
        <div key={o.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagUrl(o.departureCountryCode)} alt="" className="w-8 h-6 rounded-sm object-cover shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{o.departureCity} → {o.destinationCity}</p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                {new Date(o.travelDate).toLocaleDateString(locale === 'fr' ? 'fr' : 'en', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}{o.availableKg.toLocaleString()} kg · {o.pricePerKg.toLocaleString()} /kg
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(o.status)}`}>
              {localizedStatus(o.status, locale)}
            </span>
            <Link href={`/${locale}/mon-compte/kilos/${o.id}/modifier`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
              style={{ borderColor: '#0d9488', color: '#0d9488' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#ccfbf1')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {locale === 'fr' ? 'Modifier' : 'Edit'}
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

function FretList({ offers, isLoading, locale }: { offers?: BoatShippingOfferDto[]; isLoading: boolean; locale: string }) {
  if (isLoading) return <Skeletons />
  if (!offers?.length) return <EmptyMsg msg={locale === 'fr' ? "Aucune offre Fret bateau." : 'No sea freight offers.'} />
  return (
    <div className="divide-y" style={{ borderColor: '#e2e8f0' }}>
      {offers.map(o => (
        <div key={o.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagUrl(o.departureCountryCode)} alt="" className="w-8 h-6 rounded-sm object-cover shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{o.departurePort} → {o.destinationPort}</p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                {new Date(o.shipDepartureDate).toLocaleDateString(locale === 'fr' ? 'fr' : 'en', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}{o.availableLbs.toLocaleString()} lbs · {o.pricePerLb.toLocaleString()} /lb
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(o.status)}`}>
              {localizedStatus(o.status, locale)}
            </span>
            <Link href={`/${locale}/mon-compte/fret/${o.id}/modifier`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
              style={{ borderColor: '#0d9488', color: '#0d9488' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#ccfbf1')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {locale === 'fr' ? 'Modifier' : 'Edit'}
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
