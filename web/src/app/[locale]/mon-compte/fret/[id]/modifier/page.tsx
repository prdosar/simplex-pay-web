'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useLocale } from 'next-intl'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { UI_STATUSES, backendToUi, uiToBackend, uiStatusLabel, type UiStatus } from '@/lib/offerStatus'
import type { BoatShippingOfferDto, CountryDto } from '@/types/api'

const INPUT = 'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]'
const LABEL = 'block text-xs font-bold uppercase tracking-[0.06em] mb-2'

export default function EditBoatShippingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const locale = useLocale()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const { data: myOffers, isLoading, error: loadError } = useSWR<{ items: BoatShippingOfferDto[] }>(
    isAuthenticated ? '/api/boat-shipping/me?pageSize=100' : null,
    (url: string) => api.get<{ items: BoatShippingOfferDto[] }>(url)
  )
  const offer = myOffers?.items.find(o => o.id === id)

  const { data: countries } = useSWR<CountryDto[]>('/api/countries', (url: string) => api.get<CountryDto[]>(url))

  const [availableLbs, setAvailableLbs] = useState('')
  const [pricePerLb, setPricePerLb] = useState('')
  const [shipDepartureDate, setShipDepartureDate] = useState('')
  const [departurePort, setDeparturePort] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  const [departureCountryCode, setDepartureCountryCode] = useState('')
  const [destinationCountryCode, setDestinationCountryCode] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<UiStatus>('active')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!offer) return
    setAvailableLbs(String(offer.availableLbs))
    setPricePerLb(String(offer.pricePerLb))
    setShipDepartureDate(offer.shipDepartureDate.slice(0, 16))
    setDeparturePort(offer.departurePort)
    setDestinationPort(offer.destinationPort)
    setDepartureCountryCode(offer.departureCountryCode)
    setDestinationCountryCode(offer.destinationCountryCode)
    setNotes(offer.notes ?? '')
    setStatus(backendToUi(offer.status))
  }, [offer])

  if (!isAuthenticated) return <RedirectLogin locale={locale} />
  if (isLoading) return <Skeleton />
  if (loadError || !offer) return <NotFound locale={locale} />

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const lbs = parseFloat(availableLbs)
    const price = parseFloat(pricePerLb)
    if (isNaN(lbs) || lbs <= 0) return setError(locale === 'fr' ? 'Livres invalides.' : 'Invalid lbs.')
    if (isNaN(price) || price <= 0) return setError(locale === 'fr' ? 'Prix invalide.' : 'Invalid price.')
    if (!departurePort.trim() || !destinationPort.trim()) return setError(locale === 'fr' ? 'Ports requis.' : 'Ports required.')

    setSubmitting(true)
    try {
      await api.put(`/api/boat-shipping/${id}`, {
        availableLbs: lbs,
        pricePerLb: price,
        shipDepartureDate: new Date(shipDepartureDate).toISOString(),
        departurePort: departurePort.trim(),
        destinationPort: destinationPort.trim(),
        departureCountryCode,
        destinationCountryCode,
        notes: notes.trim() || null,
        status: uiToBackend(status),
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

      <h1 className="text-2xl font-extrabold mb-6">{locale === 'fr' ? 'Modifier une offre Fret bateau' : 'Edit sea freight offer'}</h1>

      <form onSubmit={submit} className="bg-white border rounded-2xl p-6 space-y-5" style={{ borderColor: '#e2e8f0' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Livres disponibles' : 'Available lbs'}</label>
            <input type="number" min="0" step="any" value={availableLbs} onChange={e => setAvailableLbs(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Prix par livre' : 'Price per lb'}</label>
            <input type="number" min="0" step="any" value={pricePerLb} onChange={e => setPricePerLb(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
        </div>

        <div>
          <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Date de départ du bateau' : 'Ship departure date'}</label>
          <input type="datetime-local" value={shipDepartureDate} onChange={e => setShipDepartureDate(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Port de départ' : 'Departure port'}</label>
            <input type="text" value={departurePort} onChange={e => setDeparturePort(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? "Port d'arrivée" : 'Destination port'}</label>
            <input type="text" value={destinationPort} onChange={e => setDestinationPort(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Pays de départ' : 'Departure country'}</label>
            <select value={departureCountryCode} onChange={e => setDepartureCountryCode(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }}>
              {countries?.map(c => <option key={c.code} value={c.code}>{locale === 'fr' ? c.nameFr : c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? "Pays d'arrivée" : 'Destination country'}</label>
            <select value={destinationCountryCode} onChange={e => setDestinationCountryCode(e.target.value)} className={INPUT} style={{ borderColor: '#e2e8f0' }}>
              {countries?.map(c => <option key={c.code} value={c.code}>{locale === 'fr' ? c.nameFr : c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL} style={{ color: '#64748b' }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} maxLength={500} className={INPUT + ' resize-none'} style={{ borderColor: '#e2e8f0' }} />
        </div>

        <div>
          <label className={LABEL} style={{ color: '#64748b' }}>{locale === 'fr' ? 'Statut' : 'Status'}</label>
          <select value={status} onChange={e => setStatus(e.target.value as UiStatus)} className={INPUT} style={{ borderColor: '#e2e8f0' }}>
            {UI_STATUSES.map(s => <option key={s} value={s}>{uiStatusLabel(s, locale)}</option>)}
          </select>
        </div>

        {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link href={`/${locale}/mon-compte`} className="flex-1 py-3 rounded-xl font-semibold text-center border transition-colors" style={{ borderColor: '#e2e8f0', color: '#64748b' }}>
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Link>
          <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50" style={{ background: '#0d9488' }}>
            {submitting ? (locale === 'fr' ? 'Sauvegarde…' : 'Saving…') : (locale === 'fr' ? 'Sauvegarder' : 'Save')}
          </button>
        </div>
      </form>
    </div>
  )
}

function Skeleton() {
  return <div className="max-w-2xl mx-auto px-4 py-10"><div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-6" /><div className="h-96 bg-gray-100 rounded-2xl animate-pulse" /></div>
}
function NotFound({ locale }: { locale: string }) {
  return <div className="max-w-2xl mx-auto px-4 py-16 text-center"><p style={{ color: '#ef4444' }}>{locale === 'fr' ? 'Offre introuvable ou accès non autorisé.' : 'Offer not found or unauthorized.'}</p><Link href={`/${locale}/mon-compte`} className="mt-4 inline-block text-sm hover:underline" style={{ color: '#0d9488' }}>← {locale === 'fr' ? 'Mon compte' : 'My account'}</Link></div>
}
function RedirectLogin({ locale }: { locale: string }) {
  return <div className="max-w-2xl mx-auto px-4 py-16 text-center"><p style={{ color: '#64748b' }}>{locale === 'fr' ? 'Connectez-vous pour continuer.' : 'Log in to continue.'}</p><Link href={`/${locale}/auth/connexion`} className="mt-4 inline-block px-6 py-2.5 text-white rounded-lg" style={{ background: '#0d9488' }}>{locale === 'fr' ? 'Se connecter' : 'Log in'}</Link></div>
}
