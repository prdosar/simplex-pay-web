'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'
import type { AdminStatsDto, PagedResult, AdminOfferDto, AdminUserDto } from '@/types/api'

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border] p-6">
      <p className="text-sm text-[--color-muted-foreground] mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color ?? 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-[--color-muted-foreground] mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSWR<AdminStatsDto>(
    '/api/admin/stats',
    (url: string) => api.get<AdminStatsDto>(url)
  )

  const { data: recentOffers } = useSWR<PagedResult<AdminOfferDto>>(
    '/api/offers?pageSize=5&pageNumber=1',
    (url: string) => api.get<PagedResult<AdminOfferDto>>(url)
  )

  const { data: recentUsers } = useSWR<PagedResult<AdminUserDto>>(
    '/api/admin/users?pageSize=5&pageNumber=1',
    (url: string) => api.get<PagedResult<AdminUserDto>>(url)
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-[--color-muted-foreground] text-sm mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[--color-border] p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Utilisateurs" value={stats.totalUsers} sub={`+${stats.newUsersThisWeek} cette semaine`} color="text-[--color-primary]" />
          <StatCard label="Offres totales" value={stats.totalOffers} sub={`+${stats.newOffersThisWeek} cette semaine`} />
          <StatCard label="Offres actives" value={stats.activeOffers} color="text-[--color-success]" />
          <StatCard label="Transactions" value={stats.totalTransactions} />
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-700">
          Les statistiques admin ne sont pas encore disponibles (endpoint /api/admin/stats à implémenter).
        </div>
      )}

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent offers */}
        <div className="bg-white rounded-xl border border-[--color-border]">
          <div className="px-6 py-4 border-b border-[--color-border] flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Dernières offres</h2>
            <a href="/offers" className="text-xs text-[--color-primary] hover:underline">Voir tout →</a>
          </div>
          <div className="divide-y divide-[--color-border]">
            {recentOffers?.items.map(offer => (
              <div key={offer.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{offer.sellCurrency} → {offer.buyCurrency}</p>
                  <p className="text-xs text-[--color-muted-foreground]">{offer.creator.firstName} {offer.creator.lastName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  offer.status === 'Active' ? 'bg-green-100 text-green-700' :
                  offer.status === 'Expired' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {offer.status}
                </span>
              </div>
            )) ?? (
              <p className="px-6 py-4 text-sm text-[--color-muted-foreground]">Aucune offre</p>
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-xl border border-[--color-border]">
          <div className="px-6 py-4 border-b border-[--color-border] flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Derniers utilisateurs</h2>
            <a href="/users" className="text-xs text-[--color-primary] hover:underline">Voir tout →</a>
          </div>
          <div className="divide-y divide-[--color-border]">
            {recentUsers?.items.map(user => (
              <div key={user.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[--color-primary] text-white text-xs flex items-center justify-center font-bold shrink-0">
                  {user.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[--color-muted-foreground] truncate">{user.email}</p>
                </div>
                <span className="text-xs text-[--color-muted-foreground]">{user.country}</span>
              </div>
            )) ?? (
              <p className="px-6 py-4 text-sm text-[--color-muted-foreground]">Aucun utilisateur</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
