'use client'

import { useMemo, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { api, ApiError } from '@/lib/api'
import type {
  AdminCountrySummary,
  AdminCountryPaymentMethod,
  AdminPaymentMethod,
  PaymentMethodType,
} from '@/types/api'

const PM_TYPES: { value: PaymentMethodType; label: string }[] = [
  { value: 'MobileMoney',  label: 'Mobile Money' },
  { value: 'Cash',         label: 'Cash' },
  { value: 'BankTransfer', label: 'Virement bancaire' },
  { value: 'Other',        label: 'Autre' },
]

const typeLabel = (t: PaymentMethodType) => PM_TYPES.find(x => x.value === t)?.label ?? t

export default function PaymentMethodsPage() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  const { data: countries } = useSWR<AdminCountrySummary[]>(
    '/api/admin/payment-methods/countries',
    (url: string) => api.get<AdminCountrySummary[]>(url)
  )

  const pmsUrl = selectedCode ? `/api/admin/payment-methods/countries/${selectedCode}` : null
  const { data: pms, isLoading: pmsLoading } = useSWR<AdminCountryPaymentMethod[]>(
    pmsUrl,
    (url: string) => api.get<AdminCountryPaymentMethod[]>(url)
  )

  const selectedCountry = useMemo(
    () => countries?.find(c => c.code === selectedCode) ?? null,
    [countries, selectedCode]
  )

  const refreshCountries = () => mutate('/api/admin/payment-methods/countries')
  const refreshPMs = () => { if (pmsUrl) mutate(pmsUrl) }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Moyens de paiement</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérer les mobile money & autres moyens de paiement par pays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ─────────── Colonne pays ─────────── */}
        <aside className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-slate-900">Pays</h2>
          </div>
          <ul className="divide-y divide-border max-h-[70vh] overflow-y-auto">
            {!countries && <li className="p-4 text-sm text-muted-foreground">Chargement…</li>}
            {countries?.map(c => {
              const active = selectedCode === c.code
              return (
                <li key={c.code}>
                  <button
                    onClick={() => setSelectedCode(c.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                      active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <span className="text-lg leading-none">{c.flag}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium truncate">{c.nameFr}</span>
                      <span className="block text-xs text-muted-foreground">{c.code} — {c.currencyCode}</span>
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {c.paymentMethodCount}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* ─────────── Colonne moyens de paiement du pays sélectionné ─────────── */}
        <section className="bg-white border border-border rounded-xl">
          {!selectedCountry ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Sélectionne un pays à gauche pour voir et modifier ses moyens de paiement.
            </div>
          ) : (
            <PaymentMethodsPanel
              country={selectedCountry}
              pms={pms ?? []}
              isLoading={pmsLoading}
              onChange={() => { refreshPMs(); refreshCountries() }}
            />
          )}
        </section>
      </div>
    </div>
  )
}

// ─────────── Panneau moyens de paiement d'un pays ───────────

function PaymentMethodsPanel({
  country,
  pms,
  isLoading,
  onChange,
}: {
  country: AdminCountrySummary
  pms: AdminCountryPaymentMethod[]
  isLoading: boolean
  onChange: () => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<AdminCountryPaymentMethod | null>(null)

  return (
    <>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {country.flag} {country.nameFr}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pms.length} moyen(s) de paiement — devise {country.currencyCode}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90"
        >
          + Ajouter
        </button>
      </div>

      <div className="divide-y divide-border">
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Chargement…</div>}
        {!isLoading && pms.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">Aucun moyen de paiement pour ce pays.</div>
        )}
        {pms.map(pm => (
          <PaymentMethodRow
            key={pm.id}
            countryCode={country.code}
            pm={pm}
            onChange={onChange}
            onEdit={() => setEditing(pm)}
          />
        ))}
      </div>

      {showAdd && (
        <AddPaymentMethodModal
          countryCode={country.code}
          existingIds={pms.map(p => p.id)}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); onChange() }}
        />
      )}
      {editing && (
        <EditPaymentMethodModal
          pm={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); onChange() }}
        />
      )}
    </>
  )
}

function PaymentMethodRow({
  countryCode,
  pm,
  onChange,
  onEdit,
}: {
  countryCode: string
  pm: AdminCountryPaymentMethod
  onChange: () => void
  onEdit: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function togglePopularity() {
    setBusy(true); setError(null)
    try {
      await api.patch(`/api/admin/payment-methods/countries/${countryCode}/${pm.id}/popularity`, { isPopular: !pm.isPopular })
      onChange()
    } catch (e) {
      setError(errMsg(e))
    } finally { setBusy(false) }
  }

  async function detach() {
    if (!confirm(`Retirer « ${pm.name} » de ce pays ? (le moyen de paiement reste disponible pour les autres pays)`)) return
    setBusy(true); setError(null)
    try {
      await api.delete(`/api/admin/payment-methods/countries/${countryCode}/${pm.id}`)
      onChange()
    } catch (e) {
      setError(errMsg(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900 truncate">{pm.name}</p>
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {typeLabel(pm.type)}
          </span>
          {!pm.isActive && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
              inactif
            </span>
          )}
        </div>
        {pm.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{pm.description}</p>
        )}
        {pm.offerUsageCount > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1">
            {pm.offerUsageCount} offre(s) utilisent ce moyen (suppression globale bloquée).
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={pm.isPopular}
          onChange={togglePopularity}
          disabled={busy}
          className="rounded"
          style={{ accentColor: '#0d9488' }}
        />
        <span className="text-slate-600">Populaire</span>
      </label>

      <button
        onClick={onEdit}
        disabled={busy}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted"
      >
        Renommer
      </button>
      <button
        onClick={detach}
        disabled={busy}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
      >
        Retirer
      </button>

      {error && <p className="text-xs text-red-600 ml-3">{error}</p>}
    </div>
  )
}

// ─────────── Modal : ajouter un moyen de paiement (existant OU nouveau) ───────────

function AddPaymentMethodModal({
  countryCode,
  existingIds,
  onClose,
  onSaved,
}: {
  countryCode: string
  existingIds: string[]
  onClose: () => void
  onSaved: () => void
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('new')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Existant
  const [pickedId, setPickedId] = useState('')
  const { data: allPms } = useSWR<AdminPaymentMethod[]>(
    mode === 'existing' ? '/api/admin/payment-methods' : null,
    (url: string) => api.get<AdminPaymentMethod[]>(url)
  )
  const attachable = useMemo(
    () => (allPms ?? []).filter(p => !existingIds.includes(p.id)),
    [allPms, existingIds]
  )

  // Nouveau
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PaymentMethodType>('MobileMoney')
  const [isPopular, setIsPopular] = useState(false)

  async function submit() {
    setBusy(true); setError(null)
    try {
      if (mode === 'existing') {
        if (!pickedId) throw new Error('Sélectionne un moyen de paiement.')
        await api.post(`/api/admin/payment-methods/countries/${countryCode}/attach`, {
          paymentMethodId: pickedId,
          isPopular,
        })
      } else {
        if (!name.trim()) throw new Error('Le nom est requis.')
        await api.post(`/api/admin/payment-methods/countries/${countryCode}/create`, {
          name: name.trim(),
          description: description.trim() || null,
          type,
          isPopular,
        })
      }
      onSaved()
    } catch (e) {
      setError(errMsg(e))
    } finally { setBusy(false) }
  }

  return (
    <ModalShell title="Ajouter un moyen de paiement" onClose={onClose}>
      <div className="flex gap-2 mb-4">
        <TabButton active={mode === 'new'}      onClick={() => setMode('new')}>Nouveau</TabButton>
        <TabButton active={mode === 'existing'} onClick={() => setMode('existing')}>Existant</TabButton>
      </div>

      {mode === 'new' ? (
        <div className="space-y-3">
          <Field label="Nom">
            <input value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Ex : Flooz, Moov Money" />
          </Field>
          <Field label="Type">
            <select value={type} onChange={e => setType(e.target.value as PaymentMethodType)} className={INPUT}>
              {PM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Description (optionnel)">
            <input value={description} onChange={e => setDescription(e.target.value)} className={INPUT} placeholder="Description courte" />
          </Field>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Moyen de paiement existant">
            <select value={pickedId} onChange={e => setPickedId(e.target.value)} className={INPUT}>
              <option value="">— Sélectionner —</option>
              {attachable.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({typeLabel(p.type)})</option>
              ))}
            </select>
          </Field>
          {allPms && attachable.length === 0 && (
            <p className="text-xs text-muted-foreground">Tous les moyens existants sont déjà rattachés à ce pays.</p>
          )}
        </div>
      )}

      <label className="flex items-center gap-2 mt-4 text-sm cursor-pointer">
        <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} style={{ accentColor: '#0d9488' }} />
        <span>Marquer comme populaire dans ce pays</span>
      </label>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} disabled={busy} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted">Annuler</button>
        <button onClick={submit} disabled={busy} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50">
          {busy ? '…' : 'Ajouter'}
        </button>
      </div>
    </ModalShell>
  )
}

// ─────────── Modal : renommer / éditer globalement un PM ───────────

function EditPaymentMethodModal({
  pm,
  onClose,
  onSaved,
}: {
  pm: AdminCountryPaymentMethod
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(pm.name)
  const [description, setDescription] = useState(pm.description ?? '')
  const [type, setType] = useState<PaymentMethodType>(pm.type)
  const [isActive, setIsActive] = useState(pm.isActive)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setBusy(true); setError(null)
    try {
      await api.patch(`/api/admin/payment-methods/${pm.id}`, {
        name: name.trim(),
        description: description.trim() || null,
        type,
        isActive,
      })
      onSaved()
    } catch (e) {
      setError(errMsg(e))
    } finally { setBusy(false) }
  }

  return (
    <ModalShell title="Modifier le moyen de paiement" onClose={onClose}>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-3">
        ⚠️ Ces changements s'appliquent à <strong>tous les pays</strong> où ce moyen de paiement est rattaché.
      </p>
      <div className="space-y-3">
        <Field label="Nom">
          <input value={name} onChange={e => setName(e.target.value)} className={INPUT} />
        </Field>
        <Field label="Type">
          <select value={type} onChange={e => setType(e.target.value as PaymentMethodType)} className={INPUT}>
            {PM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Description (optionnel)">
          <input value={description} onChange={e => setDescription(e.target.value)} className={INPUT} />
        </Field>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ accentColor: '#0d9488' }} />
          <span>Actif (visible aux utilisateurs)</span>
        </label>
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} disabled={busy} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted">Annuler</button>
        <button onClick={save} disabled={busy} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50">
          {busy ? '…' : 'Enregistrer'}
        </button>
      </div>
    </ModalShell>
  )
}

// ─────────── Primitives ───────────

const INPUT = 'w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  )
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-slate-900">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function errMsg(e: unknown): string {
  if (e instanceof ApiError) {
    const body = e as unknown as { body?: { message?: string } }
    return body.body?.message ?? e.message ?? 'Erreur'
  }
  if (e instanceof Error) return e.message
  return 'Erreur'
}
