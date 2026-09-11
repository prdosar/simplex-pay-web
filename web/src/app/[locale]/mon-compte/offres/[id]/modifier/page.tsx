'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useLocale } from 'next-intl'
import { Check } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { flagUrl } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { UI_STATUSES, backendToUi, uiToBackend, uiStatusLabel, type UiStatus } from '@/lib/offerStatus'
import type { OfferDto, CountryDto, PaymentMethodDto } from '@/types/api'

const INPUT = 'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]'
const LABEL = 'block text-xs font-bold uppercase tracking-[0.06em] mb-2'

// datetime-local expects "YYYY-MM-DDTHH:mm" — trim seconds and TZ.
function isoToLocalInput(iso: string): string {
  return iso.slice(0, 16)
}

export default function EditDevisesOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const locale = useLocale()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const { data: offer, isLoading, error: loadError } = useSWR<OfferDto>(
    isAuthenticated ? `/api/offers/${id}` : null,
    (url: string) => api.get<OfferDto>(url)
  )
  const { data: countries } = useSWR<CountryDto[]>(
    '/api/countries',
    (url: string) => api.get<CountryDto[]>(url)
  )

  const [amount, setAmount] = useState('')
  const [remainingAmount, setRemainingAmount] = useState('')
  const [rateMode, setRateMode] = useState<'Fixed' | 'GoogleDaily' | 'XeDaily'>('Fixed')
  const [rate, setRate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [status, setStatus] = useState<UiStatus>('active')
  const [sellCountryCodes, setSellCountryCodes] = useState<string[]>([])
  const [selectedPMs, setSelectedPMs] = useState<Set<string>>(new Set())

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hydrate form once offer arrives.
  useEffect(() => {
    if (!offer) return
    setAmount(String(offer.amount))
    setRemainingAmount(String(offer.remainingAmount))
    setRateMode(offer.rateMode)
    setRate(offer.rate !== null ? String(offer.rate) : '')
    setMinAmount(String(offer.minAmount))
    setMaxAmount(offer.maxAmount !== null ? String(offer.maxAmount) : '')
    setNotes(offer.notes ?? '')
    setExpiresAt(isoToLocalInput(offer.expiresAt))
    setStatus(backendToUi(offer.status))
    setSellCountryCodes(offer.sellCountries)
  }, [offer])

  // Pays candidats : ceux qui partagent la devise de l'offre (immuable).
  const compatibleCountries = useMemo(() => {
    if (!offer || !countries) return []
    return countries.filter(c => c.currencyCode === offer.sellCurrency)
  }, [offer, countries])

  // Union des payment methods des pays actuellement cochés.
  const availablePMs: PaymentMethodDto[] = useMemo(() => {
    if (!sellCountryCodes.length || !countries) return []
    const seen = new Map<string, PaymentMethodDto>()
    for (const code of sellCountryCodes) {
      const country = countries.find(c => c.code === code)
      country?.paymentMethods.forEach(pm => { if (!seen.has(pm.id)) seen.set(pm.id, pm) })
    }
    return Array.from(seen.values())
  }, [sellCountryCodes, countries])

  // Pre-populate selectedPMs from offer once countries + offer are loaded.
  useEffect(() => {
    if (!offer || !availablePMs.length) return
    const selectedNames = new Set(offer.paymentMethods.filter(pm => pm.side === 'From').map(pm => pm.name))
    const initial = new Set<string>(
      availablePMs.filter(pm => selectedNames.has(pm.name)).map(pm => pm.id)
    )
    setSelectedPMs(initial)
  }, [offer, availablePMs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Purge des PMs sélectionnés qui ne sont plus disponibles (pays retiré).
  useEffect(() => {
    setSelectedPMs(prev => {
      const next = new Set<string>()
      for (const id of prev) if (availablePMs.some(pm => pm.id === id)) next.add(id)
      return next
    })
  }, [availablePMs])

  function toggleSellCountry(code: string) {
    setSellCountryCodes(prev => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev
        return prev.filter(c => c !== code)
      }
      return [...prev, code]
    })
  }

  if (!isAuthenticated) return <RedirectLogin locale={locale} />
  if (isLoading) return <Skeleton />
  if (loadError || !offer) return <NotFound locale={locale} />

  function togglePM(id: string) {
    setSelectedPMs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const amt = parseFloat(amount)
    const rem = parseFloat(remainingAmount)
    if (isNaN(amt) || amt <= 0) return setError(locale === 'fr' ? 'Montant invalide.' : 'Invalid amount.')
    if (isNaN(rem) || rem < 0 || rem > amt) return setError(locale === 'fr' ? 'Le restant doit être entre 0 et le montant total.' : 'Remaining must be between 0 and total.')
    if (rateMode === 'Fixed' && (!rate || parseFloat(rate) <= 0)) return setError(locale === 'fr' ? 'Taux requis en mode Fixe.' : 'Fixed rate required.')

    if (!sellCountryCodes.length) return setError(locale === 'fr' ? 'Au moins un pays requis.' : 'At least one country required.')

    setSubmitting(true)
    try {
      await api.put(`/api/offers/${id}`, {
        amount: amt,
        remainingAmount: rem,
        rateMode,
        rate: rateMode === 'Fixed' ? parseFloat(rate) : null,
        minAmount: parseFloat(minAmount),
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        notes: notes.trim() || null,
        expiresAt: new Date(expiresAt).toISOString(),
        status: uiToBackend(status),
        paymentMethodIds: Array.from(selectedPMs),
        sellCountryCodes,
      })
      router.push(`/${locale}/mon-compte`)
    } catch (err) {
      const msg = err instanceof ApiError ? (err.body as { message?: string })?.message ?? err.message : 'Erreur'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/${locale}/mon-compte`} className="text-sm hover:underline mb-4 inline-block" style={{ color: '#64748b' }}>
        ← {locale === 'fr' ? 'Mon compte' : 'My account'}
      </Link>

      <h1 className="text-2xl font-extrabold mb-1">{locale === 'fr' ? 'Modifier une offre Devises' : 'Edit currency offer'}</h1>
      <p className="text-sm mb-6" style={{ color: '#64748b' }}>
        {offer.sellCurrency} → {offer.buyCurrency}
      </p>

      <form onSubmit={submit} className="bg-white border rounded-2xl p-6 space-y-5" style={{ borderColor: '#e2e8f0' }}>
        {/* Pays vendeurs — modifiables. Devise reste figée à offer.sellCurrency, donc seuls
            les pays partageant cette devise sont proposés. */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className={LABEL} style={{ color: '#64748b' }}>
              {locale === 'fr' ? 'Pays où votre offre est disponible' : 'Countries where your offer is available'}
            </label>
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              {locale === 'fr' ? `Devise ${offer.sellCurrency}` : `Currency ${offer.sellCurrency}`}
            </span>
          </div>
          {compatibleCountries.length === 0 ? (
            <p className="text-sm italic" style={{ color: '#94a3b8' }}>{locale === 'fr' ? 'Chargement…' : 'Loading…'}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {compatibleCountries.map(c => {
                const isSelected = sellCountryCodes.includes(c.code)
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => toggleSellCountry(c.code)}
                    aria-pressed={isSelected}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                    style={{
                      border: `2px solid ${isSelected ? '#0d9488' : '#e2e8f0'}`,
                      background: isSelected ? '#f0fdfa' : 'white',
                      color: isSelected ? '#0f766e' : '#334155',
                    }}>
                    <span className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                      style={{
                        border: `2px solid ${isSelected ? '#0d9488' : '#cbd5e1'}`,
                        background: isSelected ? '#0d9488' : 'white',
                      }}>
                      {isSelected && <Check size={12} strokeWidth={3} color="white" />}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl(c.code)} alt="" className="w-5 h-3.5 rounded-sm object-cover" />
                    <span className="flex-1 truncate">{locale === 'fr' ? c.nameFr : c.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Montant total' : 'Total amount'} ({offer.sellCurrencySymbol})</label>
            <input type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Restant disponible' : 'Remaining'} ({offer.sellCurrencySymbol})</label>
            <input type="number" min="0" step="any" value={remainingAmount} onChange={e => setRemainingAmount(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
        </div>

        <div>
          <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Mode de taux' : 'Rate mode'}</label>
          <select value={rateMode} onChange={e => setRateMode(e.target.value as typeof rateMode)} className={INPUT} style={{ borderColor: '#e2e8f0' }}>
            <option value="Fixed">{locale === 'fr' ? 'Taux fixe' : 'Fixed rate'}</option>
            <option value="GoogleDaily">{locale === 'fr' ? 'Taux Google du jour' : 'Google daily rate'}</option>
            <option value="XeDaily">{locale === 'fr' ? 'Taux XE du jour' : 'XE daily rate'}</option>
          </select>
        </div>

        {rateMode === 'Fixed' && (
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Taux fixe' : 'Fixed rate'} ({offer.sellCurrencySymbol}/{offer.buyCurrencySymbol})</label>
            <input type="number" min="0" step="any" value={rate} onChange={e => setRate(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Montant min par tranche' : 'Min per tranche'}</label>
            <input type="number" min="0" step="any" value={minAmount} onChange={e => setMinAmount(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Montant max (optionnel)' : 'Max (optional)'}</label>
            <input type="number" min="0" step="any" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} placeholder="—" />
          </div>
        </div>

        <div>
          <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Moyens de paiement acceptés' : 'Accepted payment methods'}</label>
          {availablePMs.length === 0 ? (
            <p className="text-sm italic" style={{ color: '#94a3b8' }}>{locale === 'fr' ? 'Chargement…' : 'Loading…'}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availablePMs.map(pm => {
                const checked = selectedPMs.has(pm.id)
                return (
                  <label key={pm.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-sm border"
                    style={{ background: checked ? '#ccfbf1' : 'white', borderColor: checked ? '#0d9488' : '#e2e8f0', color: checked ? '#0f766e' : '#334155' }}>
                    <input type="checkbox" checked={checked} onChange={() => togglePM(pm.id)} className="rounded" style={{ accentColor: '#0d9488' }} />
                    {pm.isPopular && <span className="text-amber-500 text-xs">★</span>}
                    <span className="font-medium">{pm.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <label className={LABEL} style={{ color: '#64748b' }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} maxLength={500}
            className={INPUT + ' resize-none'} style={{ borderColor: '#e2e8f0' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? "Expire le" : 'Expires at'}</label>
            <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Statut' : 'Status'}</label>
            <select value={status} onChange={e => setStatus(e.target.value as UiStatus)} className={INPUT} style={{ borderColor: '#e2e8f0' }}>
              {UI_STATUSES.map(s => <option key={s} value={s}>{uiStatusLabel(s, locale)}</option>)}
            </select>
          </div>
        </div>

        {/* Immuable — info only */}
        <div className="text-xs italic" style={{ color: '#94a3b8' }}>
          {locale === 'fr'
            ? `Les devises (${offer.sellCurrency}→${offer.buyCurrency}) ne sont pas modifiables.`
            : `Currencies (${offer.sellCurrency}→${offer.buyCurrency}) cannot be changed.`}
        </div>

        {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link href={`/${locale}/mon-compte`}
            className="flex-1 py-3 rounded-xl font-semibold text-center border transition-colors"
            style={{ borderColor: '#e2e8f0', color: '#64748b' }}>
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Link>
          <button type="submit" disabled={submitting}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: '#0d9488' }}>
            {submitting ? (locale === 'fr' ? 'Sauvegarde…' : 'Saving…') : (locale === 'fr' ? 'Sauvegarder' : 'Save')}
          </button>
        </div>
      </form>

    </div>
  )
}

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-6" />
      <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  )
}

function NotFound({ locale }: { locale: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p style={{ color: '#ef4444' }}>{locale === 'fr' ? 'Offre introuvable ou accès non autorisé.' : 'Offer not found or unauthorized.'}</p>
      <Link href={`/${locale}/mon-compte`} className="mt-4 inline-block text-sm hover:underline" style={{ color: '#0d9488' }}>
        ← {locale === 'fr' ? 'Mon compte' : 'My account'}
      </Link>
    </div>
  )
}

function RedirectLogin({ locale }: { locale: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p style={{ color: '#64748b' }}>{locale === 'fr' ? 'Connectez-vous pour continuer.' : 'Log in to continue.'}</p>
      <Link href={`/${locale}/auth/connexion`} className="mt-4 inline-block px-6 py-2.5 text-white rounded-lg" style={{ background: '#0d9488' }}>
        {locale === 'fr' ? 'Se connecter' : 'Log in'}
      </Link>
    </div>
  )
}
