'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import type { PagedResult, AdminOfferDto } from '@/types/api'

export default function OffersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useSWR<PagedResult<AdminOfferDto>>(
    `/api/offers?pageNumber=${page}&pageSize=20${statusFilter ? `&status=${statusFilter}` : ''}`,
    (url: string) => api.get<PagedResult<AdminOfferDto>>(url)
  )

  const statuses = ['', 'Active', 'Completed', 'Cancelled', 'Expired']

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offres</h1>
          <p className="text-[--color-muted-foreground] text-sm mt-1">
            {data?.total ?? '...'} offres au total
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[--color-primary] text-white'
                  : 'border border-[--color-border] text-slate-600 hover:bg-[--color-muted]'
              }`}
            >
              {s || 'Toutes'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[--color-border] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--color-border] bg-[--color-muted]">
              <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground]">Paire</th>
              <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground]">Type</th>
              <th className="text-right px-6 py-3 font-medium text-[--color-muted-foreground]">Taux</th>
              <th className="text-right px-6 py-3 font-medium text-[--color-muted-foreground]">Montant</th>
              <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground]">Créateur</th>
              <th className="text-left px-6 py-3 font-medium text-[--color-muted-foreground]">Statut</th>
              <th className="text-right px-6 py-3 font-medium text-[--color-muted-foreground]">Expiration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--color-border]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[--color-muted-foreground]">
                  Aucune offre trouvée
                </td>
              </tr>
            ) : (
              data?.items.map(offer => (
                <tr key={offer.id} className="hover:bg-[--color-muted] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {offer.sellCountryFlag} {offer.sellCurrency} → {offer.buyCountryFlag} {offer.buyCurrency}
                    </p>
                    <p className="text-xs text-[--color-muted-foreground]">
                      {offer.sellCountry} → {offer.buyCountry}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      offer.type === 'Sell' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {offer.type === 'Sell' ? 'Vente' : 'Achat'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-900">
                    {offer.rate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-slate-900">{offer.remainingAmount.toLocaleString()}</p>
                    <p className="text-xs text-[--color-muted-foreground]">/ {offer.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{offer.creator.firstName} {offer.creator.lastName}</p>
                    <p className="text-xs text-[--color-muted-foreground]">{offer.creator.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      offer.status === 'Active' ? 'bg-green-100 text-green-700' :
                      offer.status === 'Expired' ? 'bg-red-100 text-red-700' :
                      offer.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[--color-muted-foreground]">
                    {new Date(offer.expiresAt).toLocaleDateString('fr-CA')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[--color-border] flex items-center justify-between">
            <p className="text-sm text-[--color-muted-foreground]">
              Page {data.page} / {data.totalPages} — {data.total} offres
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-[--color-border] rounded-lg disabled:opacity-40 hover:bg-[--color-muted] transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1.5 text-sm border border-[--color-border] rounded-lg disabled:opacity-40 hover:bg-[--color-muted] transition-colors"
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
