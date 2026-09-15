'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Globe, ArrowRightLeft, Pencil, Check } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useCountries } from '@/lib/useCountries'
import type { CountryDto, OfferDto, PaymentMethodDto } from '@/types/api'
import Link from 'next/link'

type Category = 'devises' | 'kilos' | 'bateau'
type RateMode = 'GoogleDaily' | 'XeDaily' | 'Fixed'

const INPUT_CLS = 'w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]'
const SELECT_CLS = INPUT_CLS

const DEFAULT_AFRICAN_COUNTRY = 'TG' // fallback si le pays de l'user n'est pas africain

// Couleurs de marque pour les moyens de paiement (fallback = slate)
function paymentAccent(name: string, type: string): string {
  const n = name.toLowerCase()
  if (n.includes('cash')) return '#16a34a'                            // vert billets
  if (n.includes('wave')) return '#0ea5e9'                            // bleu Wave
  if (n.includes('orange money') || n.startsWith('orange')) return '#f97316' // orange
  if (n.includes('mtn') || n.includes('momo')) return '#eab308'       // jaune MTN
  if (n.includes('moov')) return '#f59e0b'                            // ambre Moov
  if (n.includes('t-money') || n.includes('tmoney')) return '#dc2626' // rouge Togocom
  if (n.includes('airtel')) return '#dc2626'                          // rouge Airtel
  if (n.includes('m-pesa') || n.includes('mpesa')) return '#16a34a'   // vert Vodacom
  if (n.includes('opay')) return '#22c55e'                            // vert OPay
  if (n.includes('palmpay')) return '#7c3aed'                         // violet PalmPay
  if (n.includes('free money')) return '#84cc16'                      // lime Free
  if (n.includes('vodafone')) return '#dc2626'                        // rouge Vodafone
  if (n.includes('africell')) return '#eab308'
  if (n.includes('qmoney')) return '#7c3aed'
  if (n.includes('interac')) return '#dc2626'                         // rouge Interac
  if (type === 'BankTransfer' || n.includes('virement') || n.includes('bank')) return '#1e40af' // bleu marine
  return '#64748b' // slate fallback
}

export default function CreateOfferPage() {
  const t = useTranslations('createOffer')
  const locale = useLocale()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()

  const { data: countries } = useCountries()

  const [category, setCategory] = useState<Category>('devises')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // ── Devises form ──
  // Multi-pays : au moins 1 sélectionné. Le 1er coché impose la devise ; les pays
  // partageant cette devise (UEMOA/CEMAC) deviennent cochables, les autres sont grisés.
  const [form, setForm] = useState({
    amount: '',
    rateMode: 'GoogleDaily' as RateMode,
    rate: '',
    minAmount: '',
    notes: '',
    expiryHours: 'never',
  })
  const [sellCountryCodes, setSellCountryCodes] = useState<string[]>([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])

  // Pays africains = ceux qui vendent une devise (currencyType='Sell')
  const africanCountries = useMemo(
    () => countries?.filter(c => c.currencyType === 'Sell') ?? [],
    [countries]
  )

  // Zones devises : liste unique des currencyCode disponibles, avec leurs pays.
  const currencyZones = useMemo(() => {
    const map = new Map<string, CountryDto[]>()
    africanCountries.forEach(c => {
      const arr = map.get(c.currencyCode) ?? []
      arr.push(c)
      map.set(c.currencyCode, arr)
    })
    return Array.from(map.entries())
      .map(([code, list]) => ({ code, countries: list }))
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [africanCountries])

  // Défaut : pays de l'user si africain, sinon Togo (1 seul coché au démarrage).
  useEffect(() => {
    if (sellCountryCodes.length || !africanCountries.length) return
    const userAfrican = user?.country ? africanCountries.find(c => c.code === user.country) : undefined
    const chosen = userAfrican?.code
      ?? africanCountries.find(c => c.code === DEFAULT_AFRICAN_COUNTRY)?.code
      ?? africanCountries[0]?.code
    if (chosen) setSellCountryCodes([chosen])
  }, [africanCountries, user?.country, sellCountryCodes.length])

  // Devise dérivée du 1er pays coché. Impose la contrainte sur les autres.
  const sellCurrencyCode = useMemo(() => {
    if (!sellCountryCodes.length) return ''
    const first = africanCountries.find(c => c.code === sellCountryCodes[0])
    return first?.currencyCode ?? ''
  }, [sellCountryCodes, africanCountries])

  // Pays visibles = ceux de la devise active seulement.
  const visibleCountries = useMemo(
    () => sellCurrencyCode
      ? africanCountries.filter(c => c.currencyCode === sellCurrencyCode)
      : africanCountries,
    [africanCountries, sellCurrencyCode]
  )

  // Changer de zone devise : reset et sélectionne le 1er pays de la nouvelle zone.
  function switchCurrencyZone(currencyCode: string) {
    if (currencyCode === sellCurrencyCode) return
    const zone = currencyZones.find(z => z.code === currencyCode)
    if (!zone?.countries.length) return
    setSellCountryCodes([zone.countries[0].code])
  }

  // Union des moyens de paiement des pays sélectionnés (dédup par id).
  const availablePaymentMethods: PaymentMethodDto[] = useMemo(() => {
    if (!sellCountryCodes.length) return []
    const seen = new Map<string, PaymentMethodDto>()
    for (const code of sellCountryCodes) {
      const country = africanCountries.find(c => c.code === code)
      country?.paymentMethods.forEach(pm => { if (!seen.has(pm.id)) seen.set(pm.id, pm) })
    }
    return Array.from(seen.values())
  }, [sellCountryCodes, africanCountries])

  // Reset des méthodes sélectionnées quand la liste dispo change (retrait de pays).
  useEffect(() => {
    setSelectedPaymentMethods(prev =>
      prev.filter(id => availablePaymentMethods.some(pm => pm.id === id))
    )
  }, [availablePaymentMethods])

  function toggleSellCountry(code: string) {
    setSellCountryCodes(prev => {
      if (prev.includes(code)) {
        // Empêche de tout décocher — au moins 1 requis
        if (prev.length === 1) return prev
        return prev.filter(c => c !== code)
      }
      return [...prev, code]
    })
  }

  // ── TravelKilo form ──
  const [tkForm, setTkForm] = useState({
    availableKg: '',
    pricePerKg: '',
    travelDate: '',
    departureCity: '',
    destinationCity: '',
    departureCountryCode: '',
    destinationCountryCode: '',
    notes: '',
  })

  // ── BoatShipping form ──
  const [bsForm, setBsForm] = useState({
    availableLbs: '',
    pricePerLb: '',
    shipDepartureDate: '',
    departurePort: '',
    destinationPort: '',
    departureCountryCode: '',
    destinationCountryCode: '',
    notes: '',
  })

  // Défaut Kilos/Fret : pays de départ = pays de l'utilisateur (destination reste vide).
  useEffect(() => {
    if (!user?.country || !countries?.some(c => c.code === user.country)) return
    setTkForm(prev => prev.departureCountryCode ? prev : { ...prev, departureCountryCode: user.country })
    setBsForm(prev => prev.departureCountryCode ? prev : { ...prev, departureCountryCode: user.country })
  }, [user?.country, countries])

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))
  const setTk = (k: keyof typeof tkForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setTkForm(prev => ({ ...prev, [k]: e.target.value }))
  const setBs = (k: keyof typeof bsForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setBsForm(prev => ({ ...prev, [k]: e.target.value }))

  function togglePaymentMethod(id: string) {
    setSelectedPaymentMethods(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleApiError(err: unknown) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        setError(locale === 'fr'
          ? 'Session expirée. Reconnecte-toi pour publier une offre.'
          : 'Session expired. Log in again to post an offer.')
        logout()
        setTimeout(() => router.push(`/${locale}/auth/connexion`), 1200)
        return
      }
      if (err.status === 403) {
        const body = err.body as { error?: string; message?: string } | undefined
        if (body?.error === 'EmailNotVerified') {
          setError(locale === 'fr'
            ? 'Vérifie ton email avant de publier une offre.'
            : 'Verify your email before posting an offer.')
          return
        }
        setError(body?.message ?? (locale === 'fr' ? 'Action non autorisée.' : 'Action not allowed.'))
        return
      }
      const body = err.body as { errors?: Record<string, string[]>; message?: string; title?: string } | undefined
      if (body?.errors) {
        setError(Object.values(body.errors).flat().join(' '))
        return
      }
      if (body?.message) { setError(body.message); return }
      if (body?.title) { setError(body.title); return }
    }
    setError(locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')
  }

  if (!isAuthenticated) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-lg mb-4">{locale === 'fr' ? 'Vous devez être connecté pour publier une offre.' : 'You must be logged in to post an offer.'}</p>
      <Link href={`/${locale}/auth/connexion`} className="px-6 py-2.5 bg-[--color-primary] text-white rounded-lg font-medium">
        {locale === 'fr' ? 'Se connecter' : 'Log in'}
      </Link>
    </div>
  )

  if (success) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold mb-2">{t('success')}</h2>
      <div className="flex gap-4 justify-center mt-6">
        <Link href={`/${locale}`} className="px-6 py-2.5 bg-[--color-primary] text-white rounded-lg font-medium">
          {locale === 'fr' ? 'Voir les offres' : 'Browse offers'}
        </Link>
        <Link href={`/${locale}/mon-compte`} className="px-6 py-2.5 border border-[--color-border] rounded-lg font-medium">
          {locale === 'fr' ? 'Mes offres' : 'My offers'}
        </Link>
      </div>
    </div>
  )

  async function handleSubmitDevises(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!sellCountryCodes.length) {
      setError(locale === 'fr' ? 'Sélectionnez au moins un pays.' : 'Select at least one country.')
      return
    }
    if (form.rateMode === 'Fixed' && (!form.rate || Number(form.rate) <= 0)) {
      setError(locale === 'fr' ? 'Renseignez votre taux fixe.' : 'Enter your fixed rate.')
      return
    }
    if (!selectedPaymentMethods.length) {
      setError(locale === 'fr' ? 'Choisissez au moins un moyen de paiement.' : 'Choose at least one payment method.')
      return
    }
    setLoading(true)
    try {
      await api.post<OfferDto>('/api/offers', {
        sellCountryCodes,
        amount: Number(form.amount),
        rateMode: form.rateMode,
        rate: form.rateMode === 'Fixed' ? Number(form.rate) : null,
        minAmount: Number(form.minAmount),
        notes: form.notes || null,
        expiryHours: form.expiryHours === 'never' ? null : Number(form.expiryHours),
        paymentMethodIds: selectedPaymentMethods,
      })
      setSuccess(true)
    } catch (err: unknown) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitTravelKilo(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/travel-kilo', {
        availableKg: Number(tkForm.availableKg),
        pricePerKg: Number(tkForm.pricePerKg),
        travelDate: new Date(tkForm.travelDate).toISOString(),
        departureCity: tkForm.departureCity,
        destinationCity: tkForm.destinationCity,
        departureCountryCode: tkForm.departureCountryCode,
        destinationCountryCode: tkForm.destinationCountryCode,
        notes: tkForm.notes || null,
      })
      setSuccess(true)
    } catch (err: unknown) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitBoatShipping(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/boat-shipping', {
        availableLbs: Number(bsForm.availableLbs),
        pricePerLb: Number(bsForm.pricePerLb),
        shipDepartureDate: new Date(bsForm.shipDepartureDate).toISOString(),
        departurePort: bsForm.departurePort,
        destinationPort: bsForm.destinationPort,
        departureCountryCode: bsForm.departureCountryCode,
        destinationCountryCode: bsForm.destinationCountryCode,
        notes: bsForm.notes || null,
      })
      setSuccess(true)
    } catch (err: unknown) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const CATEGORIES: { key: Category; label: string }[] = [
    { key: 'devises', label: t('categoryDevises') },
    { key: 'kilos',   label: t('categoryKilos') },
    { key: 'bateau',  label: t('categoryBateau') },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      {/* Category selector */}
      <div className="mb-6 max-w-2xl">
        <label className="block text-sm font-medium mb-2">{t('category')}</label>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => { setCategory(cat.key); setError('') }}
              className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                category === cat.key
                  ? 'border-[--color-primary] bg-[--color-primary-light] text-[--color-primary]'
                  : 'border-[--color-border] hover:border-[--color-primary]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DEVISES FORM ── */}
      {category === 'devises' && (
        <form onSubmit={handleSubmitDevises} className="bg-white border border-[--color-border] rounded-2xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {/* Colonne gauche : devise + pays de la zone */}
          <div className="space-y-5">
          {/* Étape 1 : picker de zone devise */}
          <div>
            <label className="block text-sm font-medium mb-2">{locale === 'fr' ? 'Devise vendue' : 'Currency to sell'}</label>
            <div className="flex flex-wrap gap-2">
              {currencyZones.map(zone => {
                const isActive = zone.code === sellCurrencyCode
                return (
                  <button
                    key={zone.code}
                    type="button"
                    onClick={() => switchCurrencyZone(zone.code)}
                    aria-pressed={isActive}
                    className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      border: `2px solid ${isActive ? '#0d9488' : '#e2e8f0'}`,
                      background: isActive ? '#0d9488' : 'white',
                      color: isActive ? 'white' : '#475569',
                    }}
                  >
                    {zone.code}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Récap : X → CAD */}
          {sellCurrencyCode && (
            <div className="flex items-center gap-3 bg-[--color-primary-light] border border-[--color-primary] rounded-xl px-4 py-2.5 text-sm">
              <span className="font-semibold">{sellCurrencyCode}</span>
              <span className="text-[--color-muted-foreground]">{t('buyCurrencyLabel')}</span>
              <span className="font-semibold">CAD</span>
            </div>
          )}

          {/* Étape 2 : pays de la zone (visible seulement si la zone en a plusieurs) */}
          {visibleCountries.length > 1 && (
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="block text-sm font-medium">{t('sellCountries')}</label>
                <span className="text-xs" style={{ color: '#94a3b8' }}>
                  {sellCountryCodes.length} / {visibleCountries.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visibleCountries.map(c => {
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
                      }}
                    >
                      <span className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{
                          border: `2px solid ${isSelected ? '#0d9488' : '#cbd5e1'}`,
                          background: isSelected ? '#0d9488' : 'white',
                        }}>
                        {isSelected && <Check size={12} strokeWidth={3} color="white" />}
                      </span>
                      <span className="flex-1 truncate">
                        {locale === 'fr' ? c.nameFr : c.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          </div>

          {/* Colonne droite : montants + rate + expiration */}
          <div className="space-y-6">
          {/* Montant disponible */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('amount')} {sellCurrencyCode && <span className="text-[--color-muted-foreground]">({sellCurrencyCode})</span>}
            </label>
            <input type="number" value={form.amount} onChange={setF('amount')} required min="1" className={INPUT_CLS} />
          </div>

          {/* Rate mode : 3 options — code couleur explicite pour la sélection */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('rateMode')}</label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { val: 'GoogleDaily', label: t('rateModeGoogle'), Icon: Globe,          accent: '#3b82f6' }, // blue
                { val: 'XeDaily',     label: t('rateModeXe'),     Icon: ArrowRightLeft, accent: '#f97316' }, // orange
                { val: 'Fixed',       label: t('rateModeFixed'),  Icon: Pencil,         accent: '#0d9488' }, // teal
              ] as { val: RateMode; label: string; Icon: typeof Globe; accent: string }[]).map(opt => {
                const isSelected = form.rateMode === opt.val
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, rateMode: opt.val }))}
                    aria-pressed={isSelected}
                    className="relative p-4 rounded-xl text-sm font-semibold text-left transition-all"
                    style={{
                      border: isSelected ? `2px solid ${opt.accent}` : '2px solid #e2e8f0',
                      background: isSelected ? `${opt.accent}12` : 'white',
                      color: isSelected ? opt.accent : '#475569',
                      boxShadow: isSelected ? `0 6px 20px -8px ${opt.accent}80` : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.borderColor = opt.accent + '80'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                      style={{
                        background: isSelected ? opt.accent : `${opt.accent}18`,
                        color: isSelected ? 'white' : opt.accent,
                      }}
                    >
                      <opt.Icon size={16} strokeWidth={2.5} />
                    </div>
                    <span className="block leading-tight">{opt.label}</span>
                    {isSelected && (
                      <span
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: opt.accent, color: 'white' }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {form.rateMode === 'Fixed' && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1.5">{t('rateFixedValue')}</label>
                <input type="number" value={form.rate} onChange={setF('rate')} required min="0.01" step="0.01" className={INPUT_CLS} placeholder="490" />
                <p className="text-xs text-[--color-muted-foreground] mt-1">
                  {t('rateFixedHelp', { sell: sellCurrencyCode || 'XOF' })}
                </p>
              </div>
            )}
          </div>

          {/* Montant minimum par tranche */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('minAmount')} {sellCurrencyCode && <span className="text-[--color-muted-foreground]">({sellCurrencyCode})</span>}
            </label>
            <input type="number" value={form.minAmount} onChange={setF('minAmount')} required min="1" className={INPUT_CLS} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('expiryHours')}</label>
            <select value={form.expiryHours} onChange={setF('expiryHours')} className={SELECT_CLS}>
              <option value="never">{t('expiryNever')}</option>
              <option value="24">24h</option>
              <option value="48">48h</option>
              <option value="72">72h</option>
              <option value="168">7 {locale === 'fr' ? 'jours' : 'days'}</option>
            </select>
            <p className="text-xs text-[--color-muted-foreground] mt-1">{t('expiryHint')}</p>
          </div>
          </div>

          {/* Moyens de paiement */}
          <div className="lg:col-span-2">
          {availablePaymentMethods.length > 0 && (() => {
            const allIds = availablePaymentMethods.map(pm => pm.id)
            const allSelected = allIds.length > 0 && allIds.every(id => selectedPaymentMethods.includes(id))
            const toggleAll = () =>
              setSelectedPaymentMethods(allSelected ? [] : allIds)

            return (
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="block text-sm font-medium">{t('paymentMethods')}</label>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>{t('paymentMethodsHint')}</span>
                </div>

                <div className="space-y-2">
                  {/* Case "tout" en tête */}
                  <button
                    type="button"
                    onClick={toggleAll}
                    aria-pressed={allSelected}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                    style={{
                      border: `2px solid ${allSelected ? '#0d9488' : '#e2e8f0'}`,
                      background: allSelected ? '#f0fdfa' : 'white',
                      color: allSelected ? '#0f766e' : '#475569',
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                      style={{
                        border: `2px solid ${allSelected ? '#0d9488' : '#cbd5e1'}`,
                        background: allSelected ? '#0d9488' : 'white',
                      }}
                    >
                      {allSelected && <Check size={12} strokeWidth={3} color="white" />}
                    </span>
                    <span className="flex-1">{allSelected ? t('paymentSelectNone') : t('paymentSelectAll')}</span>
                    <span className="text-xs font-medium" style={{ color: allSelected ? '#0f766e' : '#94a3b8' }}>
                      {selectedPaymentMethods.length} / {availablePaymentMethods.length}
                    </span>
                  </button>

                  {/* Liste individuelle — code couleur par marque */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availablePaymentMethods.map(pm => {
                      const isSelected = selectedPaymentMethods.includes(pm.id)
                      const accent = paymentAccent(pm.name, pm.type)
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => togglePaymentMethod(pm.id)}
                          aria-pressed={isSelected}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                          style={{
                            border: `2px solid ${isSelected ? accent : '#e2e8f0'}`,
                            background: isSelected ? `${accent}12` : 'white',
                            color: isSelected ? accent : '#334155',
                            boxShadow: isSelected ? `0 4px 12px -6px ${accent}80` : 'none',
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.borderColor = `${accent}80`
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0'
                          }}
                        >
                          {/* Pastille marque (visible même non sélectionné) */}
                          <span
                            className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                            style={{
                              background: isSelected ? accent : `${accent}22`,
                              border: isSelected ? 'none' : `1.5px solid ${accent}`,
                            }}
                          >
                            {isSelected
                              ? <Check size={12} strokeWidth={3} color="white" />
                              : <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                            }
                          </span>
                          <span className="flex-1 truncate">{pm.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })()}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-1.5">{t('notes')}</label>
            <textarea value={form.notes} onChange={setF('notes')} rows={3} maxLength={500}
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none" />
          </div>

          <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="text-sm rounded-lg p-3 border" style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-[15px] font-bold text-white rounded-xl transition-colors disabled:opacity-60"
            style={{ background: '#0d9488' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0f766e' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0d9488' }}
          >
            {loading ? (locale === 'fr' ? 'Publication…' : 'Publishing…') : t('submit')}
          </button>
          </div>
        </form>
      )}

      {/* ── TRAVEL KILO FORM ── */}
      {category === 'kilos' && (
        <form onSubmit={handleSubmitTravelKilo} className="bg-white border border-[--color-border] rounded-2xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {/* Col gauche : départ */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#0d9488' }}>
              {locale === 'fr' ? 'Départ' : 'Departure'}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('departureCountry')}</label>
              <select value={tkForm.departureCountryCode} onChange={setTk('departureCountryCode')} required className={SELECT_CLS}>
                <option value="">{t('selectCountry')}</option>
                {countries?.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('departureCity')}</label>
              <input type="text" value={tkForm.departureCity} onChange={setTk('departureCity')} required maxLength={100} className={INPUT_CLS} />
            </div>
          </div>

          {/* Col droite : destination */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#0d9488' }}>
              {locale === 'fr' ? 'Destination' : 'Destination'}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('destinationCountry')}</label>
              <select value={tkForm.destinationCountryCode} onChange={setTk('destinationCountryCode')} required className={SELECT_CLS}>
                <option value="">{t('selectCountry')}</option>
                {countries?.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('destinationCity')}</label>
              <input type="text" value={tkForm.destinationCity} onChange={setTk('destinationCity')} required maxLength={100} className={INPUT_CLS} />
            </div>
          </div>

          {/* Date + kg + prix (3 cols pleine largeur) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('travelDate')}</label>
              <input type="date" value={tkForm.travelDate} onChange={setTk('travelDate')} required
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('availableKg')}</label>
              <input type="number" value={tkForm.availableKg} onChange={setTk('availableKg')} required min="0.1" max="500" step="0.1" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('pricePerKg')}</label>
              <input type="number" value={tkForm.pricePerKg} onChange={setTk('pricePerKg')} required min="0.01" step="0.01" className={INPUT_CLS} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-1.5">{t('notes')}</label>
            <textarea value={tkForm.notes} onChange={setTk('notes')} rows={3} maxLength={500}
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none" />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="text-sm rounded-lg p-3 border" style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-[15px] font-bold text-white rounded-xl transition-colors disabled:opacity-60"
              style={{ background: '#0d9488' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0f766e' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0d9488' }}
            >
              {loading ? (locale === 'fr' ? 'Publication…' : 'Publishing…') : t('submit')}
            </button>
          </div>
        </form>
      )}

      {/* ── BOAT SHIPPING FORM ── */}
      {category === 'bateau' && (
        <form onSubmit={handleSubmitBoatShipping} className="bg-white border border-[--color-border] rounded-2xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#0d9488' }}>
              {locale === 'fr' ? 'Départ' : 'Departure'}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('departureCountry')}</label>
              <select value={bsForm.departureCountryCode} onChange={setBs('departureCountryCode')} required className={SELECT_CLS}>
                <option value="">{t('selectCountry')}</option>
                {countries?.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('departurePort')}</label>
              <input type="text" value={bsForm.departurePort} onChange={setBs('departurePort')} required maxLength={100} className={INPUT_CLS} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#0d9488' }}>
              {locale === 'fr' ? 'Destination' : 'Destination'}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('destinationCountry')}</label>
              <select value={bsForm.destinationCountryCode} onChange={setBs('destinationCountryCode')} required className={SELECT_CLS}>
                <option value="">{t('selectCountry')}</option>
                {countries?.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('destinationPort')}</label>
              <input type="text" value={bsForm.destinationPort} onChange={setBs('destinationPort')} required maxLength={100} className={INPUT_CLS} />
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('shipDepartureDate')}</label>
              <input type="date" value={bsForm.shipDepartureDate} onChange={setBs('shipDepartureDate')} required
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('availableLbs')}</label>
              <input type="number" value={bsForm.availableLbs} onChange={setBs('availableLbs')} required min="0.1" step="0.1" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('pricePerLb')}</label>
              <input type="number" value={bsForm.pricePerLb} onChange={setBs('pricePerLb')} required min="0.01" step="0.01" className={INPUT_CLS} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-1.5">{t('notes')}</label>
            <textarea value={bsForm.notes} onChange={setBs('notes')} rows={3} maxLength={500}
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none" />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="text-sm rounded-lg p-3 border" style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-[15px] font-bold text-white rounded-xl transition-colors disabled:opacity-60"
              style={{ background: '#0d9488' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0f766e' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0d9488' }}
            >
              {loading ? (locale === 'fr' ? 'Publication…' : 'Publishing…') : t('submit')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
