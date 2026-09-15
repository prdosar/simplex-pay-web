'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import type { PagedResult, AdminOfferDto, TravelKiloOfferDto, BoatShippingOfferDto } from '@/types/api'

type Tab = 'devises' | 'kilos' | 'bateau'

export default function OffersPage() {
  const [tab, setTab] = useState<Tab>('devises')
  const [page, setPage] = useState(1)

  // 3 catégories du marketplace — endpoints publics existants, listent l'ensemble
  // des offres actives (Open + PartiallyFilled). L'admin voit tout ce qui est en vitrine.
  const { data: devises, isLoading: devisesLoading } = useSWR<PagedResult<AdminOfferDto>>(
    tab === 'devises' ? `/api/offers?page=${page}&pageSize=20` : null,
    (url: string) => api.get<PagedResult<AdminOfferDto>>(url)
  )
  const { data: kilos, isLoading: kilosLoading } = useSWR<PagedResult<TravelKiloOfferDto>>(
    tab === 'kilos' ? `/api/travel-kilo?page=${page}&pageSize=20` : null,
    (url: string) => api.get<PagedResult<TravelKiloOfferDto>>(url)
  )
  const { data: bateau, isLoading: bateauLoading } = useSWR<PagedResult<BoatShippingOfferDto>>(
    tab === 'bateau' ? `/api/boat-shipping?page=${page}&pageSize=20` : null,
    (url: string) => api.get<PagedResult<BoatShippingOfferDto>>(url)
  )

  // Compteurs globaux (indépendants du tab actif) pour les badges d'onglets.
  const { data: devisesCount } = useSWR<PagedResult<AdminOfferDto>>('/api/offers?pageSize=1', (u: string) => api.get<PagedResult<AdminOfferDto>>(u))
  const { data: kilosCount }   = useSWR<PagedResult<TravelKiloOfferDto>>('/api/travel-kilo?pageSize=1', (u: string) => api.get<PagedResult<TravelKiloOfferDto>>(u))
  const { data: bateauCount }  = useSWR<PagedResult<BoatShippingOfferDto>>('/api/boat-shipping?pageSize=1', (u: string) => api.get<PagedResult<BoatShippingOfferDto>>(u))

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'devises', label: 'Devises',      count: devisesCount?.total },
    { key: 'kilos',   label: 'Kilos voyage', count: kilosCount?.total },
    { key: 'bateau',  label: 'Fret bateau',  count: bateauCount?.total },
  ]

  const activeData = tab === 'devises' ? devises : tab === 'kilos' ? kilos : bateau
  const activeLoading = tab === 'devises' ? devisesLoading : tab === 'kilos' ? kilosLoading : bateauLoading

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Offres</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {activeData ? `${activeData.total} offres actives dans cette catégorie` : '...'}
        </p>
      </div>

      {/* Tabs catégories */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1) }}
            className={`px-4 py-2 text-sm rounded-lg font-semibold transition-colors inline-flex items-center gap-2 ${
              tab === t.key
                ? 'bg-primary text-white'
                : 'border border-border text-slate-600 hover:bg-muted'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span
                className="text-[11px] font-bold px-1.5 py-[1px] rounded-full min-w-[20px] text-center"
                style={{
                  background: tab === t.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: tab === t.key ? 'white' : '#0d9488',
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {tab === 'devises' && (
          <DevisesTable data={devises} isLoading={activeLoading} />
        )}
        {tab === 'kilos' && (
          <KilosTable data={kilos} isLoading={activeLoading} />
        )}
        {tab === 'bateau' && (
          <FretTable data={bateau} isLoading={activeLoading} />
        )}

        {activeData && activeData.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {activeData.page} / {activeData.totalPages} — {activeData.total} offres
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(activeData.totalPages, p + 1))}
                disabled={page === activeData.totalPages}
                className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const cls = status === 'Open' || status === 'Active' ? 'bg-green-100 text-green-700'
    : status === 'PartiallyFilled' ? 'bg-amber-100 text-amber-700'
    : status === 'Expired' ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-600'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{status}</span>
}

function LoadingRows({ cols }: { cols: number }) {
  return <>{Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
      ))}
    </tr>
  ))}</>
}

function EmptyRow({ cols, msg }: { cols: number; msg: string }) {
  return <tr><td colSpan={cols} className="px-6 py-12 text-center text-muted-foreground">{msg}</td></tr>
}

function DevisesTable({ data, isLoading }: { data?: PagedResult<AdminOfferDto>; isLoading: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-muted">
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Paire</th>
          <th className="text-right px-6 py-3 font-medium text-muted-foreground">Taux</th>
          <th className="text-right px-6 py-3 font-medium text-muted-foreground">Montant</th>
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Créateur</th>
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Statut</th>
          <th className="text-right px-6 py-3 font-medium text-muted-foreground">Expire le</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {isLoading ? <LoadingRows cols={6} />
          : data?.items.length === 0 ? <EmptyRow cols={6} msg="Aucune offre Devises." />
          : data?.items.map(offer => (
            <tr key={offer.id} className="hover:bg-muted transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{offer.sellCurrency} → {offer.buyCurrency}</p>
                <p className="text-xs text-muted-foreground">{offer.sellCountry} → {offer.buyCountry}</p>
              </td>
              <td className="px-6 py-4 text-right font-mono text-slate-900">{offer.rate?.toLocaleString() ?? '—'}</td>
              <td className="px-6 py-4 text-right">
                <p className="text-slate-900">{offer.remainingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">/ {offer.amount.toLocaleString()}</p>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium">{offer.creator.firstName} {offer.creator.lastName}</p>
                <p className="text-xs text-muted-foreground">{offer.creator.email}</p>
              </td>
              <td className="px-6 py-4"><StatusPill status={offer.status} /></td>
              <td className="px-6 py-4 text-right text-muted-foreground">{offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString('fr-CA') : '—'}</td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}

function KilosTable({ data, isLoading }: { data?: PagedResult<TravelKiloOfferDto>; isLoading: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-muted">
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Route</th>
          <th className="text-right px-6 py-3 font-medium text-muted-foreground">Kg dispo</th>
          <th className="text-right px-6 py-3 font-medium text-muted-foreground">Prix/kg</th>
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Départ</th>
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Voyageur</th>
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Statut</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {isLoading ? <LoadingRows cols={6} />
          : data?.items.length === 0 ? <EmptyRow cols={6} msg="Aucune offre Kilos." />
          : data?.items.map(o => (
            <tr key={o.id} className="hover:bg-muted transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{o.departureCity} → {o.destinationCity}</p>
                <p className="text-xs text-muted-foreground">{o.departureCountryCode} → {o.destinationCountryCode}</p>
              </td>
              <td className="px-6 py-4 text-right font-mono text-slate-900">{o.availableKg.toLocaleString()} kg</td>
              <td className="px-6 py-4 text-right font-mono text-slate-900">{o.pricePerKg.toLocaleString()}</td>
              <td className="px-6 py-4 text-muted-foreground">{new Date(o.travelDate).toLocaleDateString('fr-CA')}</td>
              <td className="px-6 py-4"><p className="font-medium">{o.creatorFirstName}</p></td>
              <td className="px-6 py-4"><StatusPill status={o.status} /></td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}

function FretTable({ data, isLoading }: { data?: PagedResult<BoatShippingOfferDto>; isLoading: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-muted">
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Route</th>
          <th className="text-right px-6 py-3 font-medium text-muted-foreground">Lbs dispo</th>
          <th className="text-right px-6 py-3 font-medium text-muted-foreground">Prix/lb</th>
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Départ</th>
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Expéditeur</th>
          <th className="text-left px-6 py-3 font-medium text-muted-foreground">Statut</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {isLoading ? <LoadingRows cols={6} />
          : data?.items.length === 0 ? <EmptyRow cols={6} msg="Aucune offre Fret." />
          : data?.items.map(o => (
            <tr key={o.id} className="hover:bg-muted transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{o.departurePort} → {o.destinationPort}</p>
                <p className="text-xs text-muted-foreground">{o.departureCountryCode} → {o.destinationCountryCode}</p>
              </td>
              <td className="px-6 py-4 text-right font-mono text-slate-900">{o.availableLbs.toLocaleString()} lbs</td>
              <td className="px-6 py-4 text-right font-mono text-slate-900">{o.pricePerLb.toLocaleString()}</td>
              <td className="px-6 py-4 text-muted-foreground">{new Date(o.shipDepartureDate).toLocaleDateString('fr-CA')}</td>
              <td className="px-6 py-4"><p className="font-medium">{o.creatorFirstName}</p></td>
              <td className="px-6 py-4"><StatusPill status={o.status} /></td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}
