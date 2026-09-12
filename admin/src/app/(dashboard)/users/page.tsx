'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import type { PagedResult, AdminUserDto } from '@/types/api'

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pending, setPending] = useState<Set<string>>(new Set())

  const { data, isLoading, mutate } = useSWR<PagedResult<AdminUserDto>>(
    `/api/admin/users?pageNumber=${page}&pageSize=20${debouncedSearch ? `&search=${debouncedSearch}` : ''}`,
    (url: string) => api.get<PagedResult<AdminUserDto>>(url)
  )

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    const val = e.target.value
    setTimeout(() => setDebouncedSearch(val), 300)
    setPage(1)
  }

  async function toggleCertified(user: AdminUserDto) {
    const next = !user.isCertified
    setPending(prev => new Set(prev).add(user.id))
    // Optimistic update
    mutate(current => current && ({
      ...current,
      items: current.items.map(u => u.id === user.id ? { ...u, isCertified: next } : u),
    }), false)
    try {
      await api.patch(`/api/admin/users/${user.id}/certify`, { isCertified: next })
      mutate()
    } catch {
      // Rollback on failure
      mutate(current => current && ({
        ...current,
        items: current.items.map(u => u.id === user.id ? { ...u, isCertified: !next } : u),
      }), false)
      alert('Échec de la certification. Réessaie.')
    } finally {
      setPending(prev => {
        const s = new Set(prev)
        s.delete(user.id)
        return s
      })
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? '...'} utilisateurs enregistrés
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-border mb-4 px-4 py-3 flex items-center gap-3">
        <span className="text-muted-foreground">🔍</span>
        <input
          type="text"
          placeholder="Rechercher par nom, email..."
          value={search}
          onChange={handleSearch}
          className="flex-1 text-sm focus:outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Utilisateur</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Pays</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-center px-6 py-3 font-medium text-muted-foreground">Certifié</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Note</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Avis</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-14 mx-auto" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10 ml-auto" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 ml-auto" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 ml-auto" /></td>
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              data?.items.map(user => (
                <tr key={user.id} className="hover:bg-muted transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0">
                        {user.firstName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 flex items-center gap-1.5">
                          {user.firstName} {user.lastName}
                          {user.isCertified && (
                            <span title="Utilisateur certifié" className="text-primary">✓</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{user.country}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' :
                      user.status === 'Suspended' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleCertified(user)}
                      disabled={pending.has(user.id)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${
                        user.isCertified
                          ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={user.isCertified ? 'Cliquer pour décertifier' : 'Cliquer pour certifier'}
                    >
                      {user.isCertified ? '✓ Certifié' : 'Certifier'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.reviewCount > 0 ? `⭐ ${user.rating.toFixed(1)}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-900">{user.reviewCount}</td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('fr-CA')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.page} / {data.totalPages} — {data.total} utilisateurs
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
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
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
