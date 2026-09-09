'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { CurrencyDto, CountryDto, OfferDto, PaymentMethodDto } from '@/types/api'
import Link from 'next/link'

type Category = 'devises' | 'kilos' | 'bateau'

const INPUT_CLS = 'w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]'
const SELECT_CLS = INPUT_CLS

export default function CreateOfferPage() {
  const t = useTranslations('createOffer')
  const locale = useLocale()
  const { isAuthenticated } = useAuth()

  const { data: currencies } = useSWR<CurrencyDto[]>('/api/currencies', (url: string) => api.get<CurrencyDto[]>(url))
  const { data: countries } = useSWR<CountryDto[]>('/api/countries', (url: string) => api.get<CountryDto[]>(url))

  const [category, setCategory] = useState<Category>('devises')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // ── Devises form ──
  const [form, setForm] = useState({
    type: 'Sell',
    sellCurrencyCode: '',
    buyCurrencyCode: '',
    sellCountryCode: '',
    buyCountryCode: '',
    amount: '',
    rate: '',
    minAmount: '',
    maxAmount: '',
    notes: '',
    expiryHours: '48',
  })
  const [selectedFromMethods, setSelectedFromMethods] = useState<string[]>([])
  const [selectedToMethods, setSelectedToMethods] = useState<string[]>([])

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

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))
  const setTk = (k: keyof typeof tkForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setTkForm(prev => ({ ...prev, [k]: e.target.value }))
  const setBs = (k: keyof typeof bsForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setBsForm(prev => ({ ...prev, [k]: e.target.value }))

  const sellCountries = countries?.filter(c => c.currencyCode === form.sellCurrencyCode) ?? []
  const buyCountries = countries?.filter(c => c.currencyCode === form.buyCurrencyCode) ?? []
  const sellCountryData = countries?.find(c => c.code === form.sellCountryCode)
  const buyCountryData = countries?.find(c => c.code === form.buyCountryCode)
  const sellMethods: PaymentMethodDto[] = sellCountryData?.paymentMethods ?? []
  const buyMethods: PaymentMethodDto[] = buyCountryData?.paymentMethods ?? []
  const sellCurrencies = currencies?.filter(c => c.type === 'Sell') ?? []
  const buyCurrencies = currencies?.filter(c => c.type === 'Buy') ?? []

  function toggleMethod(id: string, side: 'from' | 'to') {
    if (side === 'from') {
      setSelectedFromMethods(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
      setSelectedToMethods(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
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
    setLoading(true)
    try {
      const paymentMethods = [
        ...selectedFromMethods.map(id => ({ paymentMethodId: id, side: 'From' })),
        ...selectedToMethods.map(id => ({ paymentMethodId: id, side: 'To' })),
      ]
      await api.post<OfferDto>('/api/offers', {
        ...form,
        amount: Number(form.amount),
        rate: Number(form.rate),
        minAmount: Number(form.minAmount),
        maxAmount: Number(form.maxAmount),
        expiryHours: Number(form.expiryHours),
        paymentMethods,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]> }
      if (e.errors) setError(Object.values(e.errors).flat().join(' '))
      else setError(locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')
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
      const e = err as { errors?: Record<string, string[]> }
      if (e.errors) setError(Object.values(e.errors).flat().join(' '))
      else setError(locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')
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
      const e = err as { errors?: Record<string, string[]> }
      if (e.errors) setError(Object.values(e.errors).flat().join(' '))
      else setError(locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')
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
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      {/* Category selector */}
      <div className="mb-6">
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
        <form onSubmit={handleSubmitDevises} className="bg-white border border-[--color-border] rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('type')}</label>
            <div className="grid grid-cols-2 gap-3">
              {[{val:'Sell', label:t('typeSell')}, {val:'Buy', label:t('typeBuy')}].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setForm(p => ({...p, type:opt.val}))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    form.type === opt.val
                      ? 'border-[--color-primary] bg-[--color-primary-light] text-[--color-primary]'
                      : 'border-[--color-border] hover:border-[--color-primary]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('sellCurrency')}</label>
              <select value={form.sellCurrencyCode} onChange={e => setForm(p => ({...p, sellCurrencyCode: e.target.value, sellCountryCode: ''}))}
                className={SELECT_CLS}>
                {sellCurrencies.map(c => <option key={c.code} value={c.code}>{c.code} — {locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('buyCurrency')}</label>
              <select value={form.buyCurrencyCode} onChange={e => setForm(p => ({...p, buyCurrencyCode: e.target.value, buyCountryCode: ''}))}
                className={SELECT_CLS}>
                {buyCurrencies.map(c => <option key={c.code} value={c.code}>{c.code} — {locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('sellCountry')}</label>
              <select value={form.sellCountryCode} onChange={setF('sellCountryCode')} className={SELECT_CLS}>
                {sellCountries.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('buyCountry')}</label>
              <select value={form.buyCountryCode} onChange={setF('buyCountryCode')} className={SELECT_CLS}>
                {buyCountries.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('amount')}</label>
              <input type="number" value={form.amount} onChange={setF('amount')} required min="1" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('rate')}</label>
              <input type="number" value={form.rate} onChange={setF('rate')} required min="0.01" step="0.01" className={INPUT_CLS} />
              <p className="text-xs text-[--color-muted-foreground] mt-1">{t('rateHelp')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('minAmount')}</label>
              <input type="number" value={form.minAmount} onChange={setF('minAmount')} required min="1" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('maxAmount')}</label>
              <input type="number" value={form.maxAmount} onChange={setF('maxAmount')} required min="1" className={INPUT_CLS} />
            </div>
          </div>

          {sellMethods.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">{t('paymentMethods')} — {t('from')}</label>
              <div className="flex flex-wrap gap-2">
                {sellMethods.map(pm => (
                  <button key={pm.id} type="button" onClick={() => toggleMethod(pm.id, 'from')}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedFromMethods.includes(pm.id)
                        ? 'border-[--color-primary] bg-[--color-primary-light] text-[--color-primary]'
                        : 'border-[--color-border] text-[--color-muted-foreground] hover:border-[--color-primary]'
                    }`}>
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {buyMethods.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">{t('paymentMethods')} — {t('to')}</label>
              <div className="flex flex-wrap gap-2">
                {buyMethods.map(pm => (
                  <button key={pm.id} type="button" onClick={() => toggleMethod(pm.id, 'to')}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedToMethods.includes(pm.id)
                        ? 'border-[--color-primary] bg-[--color-primary-light] text-[--color-primary]'
                        : 'border-[--color-border] text-[--color-muted-foreground] hover:border-[--color-primary]'
                    }`}>
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('expiryHours')}</label>
              <select value={form.expiryHours} onChange={setF('expiryHours')} className={SELECT_CLS}>
                <option value="24">24h</option>
                <option value="48">48h</option>
                <option value="72">72h</option>
                <option value="168">7 {locale === 'fr' ? 'jours' : 'days'}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t('notes')}</label>
            <textarea value={form.notes} onChange={setF('notes')} rows={3} maxLength={500}
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none" />
          </div>

          {error && <div className="text-sm text-[--color-destructive] bg-red-50 rounded-lg p-3">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[--color-primary] text-white font-semibold rounded-xl hover:bg-[--color-primary-dark] transition-colors disabled:opacity-60">
            {loading ? '...' : t('submit')}
          </button>
        </form>
      )}

      {/* ── TRAVEL KILO FORM ── */}
      {category === 'kilos' && (
        <form onSubmit={handleSubmitTravelKilo} className="bg-white border border-[--color-border] rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('travelDate')}</label>
            <input type="date" value={tkForm.travelDate} onChange={setTk('travelDate')} required
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className={INPUT_CLS} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('availableKg')}</label>
              <input type="number" value={tkForm.availableKg} onChange={setTk('availableKg')} required min="0.1" max="500" step="0.1" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('pricePerKg')}</label>
              <input type="number" value={tkForm.pricePerKg} onChange={setTk('pricePerKg')} required min="0.01" step="0.01" className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('notes')}</label>
            <textarea value={tkForm.notes} onChange={setTk('notes')} rows={3} maxLength={500}
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none" />
          </div>

          {error && <div className="text-sm text-[--color-destructive] bg-red-50 rounded-lg p-3">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[--color-primary] text-white font-semibold rounded-xl hover:bg-[--color-primary-dark] transition-colors disabled:opacity-60">
            {loading ? '...' : t('submit')}
          </button>
        </form>
      )}

      {/* ── BOAT SHIPPING FORM ── */}
      {category === 'bateau' && (
        <form onSubmit={handleSubmitBoatShipping} className="bg-white border border-[--color-border] rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('shipDepartureDate')}</label>
            <input type="date" value={bsForm.shipDepartureDate} onChange={setBs('shipDepartureDate')} required
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className={INPUT_CLS} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('availableLbs')}</label>
              <input type="number" value={bsForm.availableLbs} onChange={setBs('availableLbs')} required min="0.1" step="0.1" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('pricePerLb')}</label>
              <input type="number" value={bsForm.pricePerLb} onChange={setBs('pricePerLb')} required min="0.01" step="0.01" className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('notes')}</label>
            <textarea value={bsForm.notes} onChange={setBs('notes')} rows={3} maxLength={500}
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none" />
          </div>

          {error && <div className="text-sm text-[--color-destructive] bg-red-50 rounded-lg p-3">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[--color-primary] text-white font-semibold rounded-xl hover:bg-[--color-primary-dark] transition-colors disabled:opacity-60">
            {loading ? '...' : t('submit')}
          </button>
        </form>
      )}
    </div>
  )
}
