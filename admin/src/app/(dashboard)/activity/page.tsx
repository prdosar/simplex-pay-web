'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import type { PagedResult, ActivityLogDto } from '@/types/api'

// Actions communes aux 2 onglets (site public + panel admin utilisent le même /api/auth/*).
// À maintenir en phase avec DeriveAction() dans ActivityLoggingMiddleware.cs.
const WEB_ACTIONS = [
  { value: 'register', label: 'Inscription' },
  { value: 'login', label: 'Connexion' },
  { value: 'verify_email', label: 'Vérification email' },
  { value: 'resend_verification_code', label: 'Renvoi code' },
  { value: 'refresh_token', label: 'Refresh token' },
  { value: 'view_own_profile', label: 'Voir son profil' },
  { value: 'edit_own_profile', label: 'Modif profil (user)' },
  { value: 'view_user_profile', label: 'Voir profil user' },
  { value: 'view_user_reviews', label: 'Voir avis user' },
  { value: 'submit_review', label: 'Soumettre avis' },
  { value: 'browse_devises', label: 'Browse Devises' },
  { value: 'view_offer_devises', label: 'Voir offre Devises' },
  { value: 'create_offer_devises', label: 'Créer offre Devises' },
  { value: 'update_offer_devises', label: 'Modif offre Devises' },
  { value: 'cancel_offer_devises', label: 'Clôturer offre Devises' },
  { value: 'view_my_offers_devises', label: 'Mes offres Devises' },
  { value: 'browse_kilos', label: 'Browse Kilos' },
  { value: 'view_offer_kilos', label: 'Voir offre Kilos' },
  { value: 'create_offer_kilos', label: 'Créer offre Kilos' },
  { value: 'update_offer_kilos', label: 'Modif offre Kilos' },
  { value: 'view_my_offers_kilos', label: 'Mes offres Kilos' },
  { value: 'browse_fret', label: 'Browse Fret' },
  { value: 'view_offer_fret', label: 'Voir offre Fret' },
  { value: 'create_offer_fret', label: 'Créer offre Fret' },
  { value: 'update_offer_fret', label: 'Modif offre Fret' },
  { value: 'view_my_offers_fret', label: 'Mes offres Fret' },
]

const ADMIN_ACTIONS = [
  { value: 'admin_login', label: 'Connexion admin' },
  { value: 'admin_verify_email', label: 'Vérif email admin' },
  { value: 'admin_resend_verification_code', label: 'Renvoi code admin' },
  { value: 'admin_refresh_token', label: 'Refresh token admin' },
  { value: 'admin_view_own_profile', label: 'Voir son profil (admin)' },
  { value: 'admin_view_stats', label: 'Voir stats' },
  { value: 'admin_view_activity_logs', label: 'Voir journal activité' },
  { value: 'admin_list_users', label: 'Liste utilisateurs' },
  { value: 'admin_certify_user', label: 'Certifier utilisateur' },
  { value: 'admin_edit_user_profile', label: 'Modif profil utilisateur' },
]

type Tab = 'Web' | 'Admin'

export default function ActivityPage() {
  const [tab, setTab] = useState<Tab>('Web')
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [country, setCountry] = useState('')
  const [from, setFrom] = useState('')  // YYYY-MM-DD
  const [to, setTo] = useState('')

  const qs = new URLSearchParams({ page: String(page), pageSize: '10', source: tab })
  if (action) qs.set('action', action)
  if (ipAddress) qs.set('ipAddress', ipAddress)
  if (country) qs.set('country', country.toUpperCase())
  if (from) qs.set('from', new Date(from + 'T00:00:00').toISOString())
  if (to) qs.set('to', new Date(to + 'T23:59:59').toISOString())

  const { data, isLoading } = useSWR<PagedResult<ActivityLogDto>>(
    `/api/admin/activity-logs?${qs.toString()}`,
    (url: string) => api.get<PagedResult<ActivityLogDto>>(url),
    { refreshInterval: 15000 }  // auto-refresh toutes les 15s
  )

  function resetFilters() {
    setAction(''); setIpAddress(''); setCountry(''); setFrom(''); setTo(''); setPage(1)
  }
  const hasFilter = !!(action || ipAddress || country || from || to)

  function switchTab(next: Tab) {
    if (next === tab) return
    setTab(next)
    // Le filtre "action" est dépendant de l'onglet : on le reset au changement.
    setAction('')
    setPage(1)
  }

  const knownActions = tab === 'Admin' ? ADMIN_ACTIONS : WEB_ACTIONS

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Journal d&apos;activité</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data ? `${data.total} événements` : '...'} · rafraîchissement auto 15s
        </p>
      </div>

      {/* Onglets Web / Admin */}
      <div className="mb-4 border-b border-border flex gap-1">
        <TabButton active={tab === 'Web'} onClick={() => switchTab('Web')}>
          Site web
        </TabButton>
        <TabButton active={tab === 'Admin'} onClick={() => switchTab('Admin')}>
          Panel admin
        </TabButton>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-border rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">Action</label>
            <select
              value={action}
              onChange={e => { setAction(e.target.value); setPage(1) }}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Toutes les actions</option>
              {knownActions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">Adresse IP</label>
            <input
              value={ipAddress}
              onChange={e => { setIpAddress(e.target.value); setPage(1) }}
              placeholder="ex: 192.168.1.1"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">Pays (ISO)</label>
            <input
              value={country}
              onChange={e => { setCountry(e.target.value.toUpperCase()); setPage(1) }}
              placeholder="TG"
              maxLength={2}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">Depuis</label>
            <input
              type="date"
              value={from}
              onChange={e => { setFrom(e.target.value); setPage(1) }}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">Jusqu&apos;à</label>
            <input
              type="date"
              value={to}
              onChange={e => { setTo(e.target.value); setPage(1) }}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        {hasFilter && (
          <button
            onClick={resetFilters}
            className="mt-3 text-xs font-semibold text-destructive hover:underline"
          >
            × Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date/heure</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lieu</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-full" /></td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  Aucun événement trouvé
                </td>
              </tr>
            ) : (
              data?.items.map(l => (
                <tr key={l.id} className="hover:bg-muted transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-900 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString('fr-CA', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {l.userId ? (
                      <div>
                        <p className="text-sm font-medium">{l.userFirstName} {l.userLastName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{l.userEmail}</p>
                      </div>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">anonyme</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono bg-muted rounded px-2 py-0.5">{l.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-900">{l.ipAddress}</td>
                  <td className="px-4 py-3 text-xs">
                    {l.country ? (
                      <span>{flagEmoji(l.country)} {l.country}{l.city ? ` · ${l.city}` : ''}</span>
                    ) : (
                      <span className="italic text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      l.statusCode < 300 ? 'bg-green-100 text-green-700' :
                      l.statusCode < 400 ? 'bg-blue-100 text-blue-700' :
                      l.statusCode < 500 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{l.statusCode}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.page} / {data.totalPages} — {data.total} événements
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

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

// Convertit ISO code (TG) en emoji drapeau (🇹🇬) via regional indicator symbols.
function flagEmoji(iso: string): string {
  if (iso.length !== 2) return ''
  const A = 0x1F1E6
  return String.fromCodePoint(A + iso.toUpperCase().charCodeAt(0) - 65)
       + String.fromCodePoint(A + iso.toUpperCase().charCodeAt(1) - 65)
}
