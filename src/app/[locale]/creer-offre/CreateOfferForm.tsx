'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { CircleCheck } from 'lucide-react'
import {
  createBoatShippingOfferAction,
  createDevisesOfferAction,
  createTravelKiloOfferAction,
} from '@/app/actions/offers'
import type { CountryDto, CurrencyDto } from '@/types/api'

type Category = 'devises' | 'kilos' | 'bateau'

export default function CreateOfferForm({
  locale,
  currencies,
  countries,
}: {
  locale: string
  currencies: CurrencyDto[]
  countries: CountryDto[]
}) {
  const t = useTranslations('createOffer')
  const [isPending, startTransition] = useTransition()

  const [category, setCategory] = useState<Category>('devises')
  const [error, setError] = useState('')
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

  const sellCountries = countries.filter(c => c.currencyCode === form.sellCurrencyCode)
  const buyCountries = countries.filter(c => c.currencyCode === form.buyCurrencyCode)
  const sellCountryData = countries.find(c => c.code === form.sellCountryCode)
  const buyCountryData = countries.find(c => c.code === form.buyCountryCode)
  const sellMethods = sellCountryData?.paymentMethods ?? []
  const buyMethods = buyCountryData?.paymentMethods ?? []
  const sellCurrencies = currencies.filter(c => c.type === 'Sell')
  const buyCurrencies = currencies.filter(c => c.type === 'Buy')

  function toggleMethod(id: string, side: 'from' | 'to') {
    if (side === 'from') {
      setSelectedFromMethods(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
      setSelectedToMethods(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  async function submit(action: () => Promise<{ error?: string }>) {
    setError('')
    startTransition(async () => {
      try {
        const result = await action()
        if (result.error) setError(result.error)
        else setSuccess(true)
      } catch {
        setError(locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')
      }
    })
  }

  function handleSubmitDevises(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sellCountryCode || !form.buyCountryCode || form.sellCountryCode === form.buyCountryCode) {
      setError(locale === 'fr'
        ? 'Sélectionnez des pays de vente et d\'achat différents.'
        : 'Select different sell and buy countries.')
      return
    }
    submit(() => createDevisesOfferAction({
      locale,
      type: form.type,
      sellCountryCode: form.sellCountryCode,
      buyCountryCode: form.buyCountryCode,
      amount: Number(form.amount),
      rate: Number(form.rate),
      minAmount: Number(form.minAmount),
      maxAmount: Number(form.maxAmount),
      notes: form.notes || undefined,
      expiryHours: Number(form.expiryHours),
      paymentMethods: [
        ...selectedFromMethods.map(id => ({ paymentMethodId: id, side: 'From' as const })),
        ...selectedToMethods.map(id => ({ paymentMethodId: id, side: 'To' as const })),
      ],
    }))
  }

  function handleSubmitTravelKilo(e: React.FormEvent) {
    e.preventDefault()
    submit(() => createTravelKiloOfferAction({
      locale,
      availableKg: Number(tkForm.availableKg),
      pricePerKg: Number(tkForm.pricePerKg),
      travelDate: new Date(tkForm.travelDate).toISOString(),
      departureCity: tkForm.departureCity,
      destinationCity: tkForm.destinationCity,
      departureCountryCode: tkForm.departureCountryCode,
      destinationCountryCode: tkForm.destinationCountryCode,
      notes: tkForm.notes || undefined,
    }))
  }

  function handleSubmitBoatShipping(e: React.FormEvent) {
    e.preventDefault()
    submit(() => createBoatShippingOfferAction({
      locale,
      availableLbs: Number(bsForm.availableLbs),
      pricePerLb: Number(bsForm.pricePerLb),
      shipDepartureDate: new Date(bsForm.shipDepartureDate).toISOString(),
      departurePort: bsForm.departurePort,
      destinationPort: bsForm.destinationPort,
      departureCountryCode: bsForm.departureCountryCode,
      destinationCountryCode: bsForm.destinationCountryCode,
      notes: bsForm.notes || undefined,
    }))
  }

  const CATEGORIES: { key: Category; label: string }[] = [
    { key: 'devises', label: t('categoryDevises') },
    { key: 'kilos',   label: t('categoryKilos') },
    { key: 'bateau',  label: t('categoryBateau') },
  ]

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="inline-flex w-16 h-16 rounded-2xl bg-primary-light border border-primary-bright/25 text-primary-bright items-center justify-center mb-5">
          <CircleCheck className="w-8 h-8" />
        </span>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">{t('success')}</h2>
        <div className="flex gap-4 justify-center mt-8 flex-wrap">
          <Link href={`/${locale}`} className="btn-primary !px-6 !py-2.5 text-sm">
            {locale === 'fr' ? 'Voir les offres' : 'Browse offers'}
          </Link>
          <Link href={`/${locale}/mon-compte`} className="btn-outline !px-6 !py-2.5 text-sm">
            {locale === 'fr' ? 'Mes offres' : 'My offers'}
          </Link>
        </div>
      </div>
    )
  }

  const pillActive = 'border-primary/50 bg-primary-light text-primary'
  const pillInactive = 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-primary'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-foreground mb-8 tracking-tight">{t('title')}</h1>

      {/* Category selector */}
      <div className="mb-6">
        <label className="field-label">{t('category')}</label>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => { setCategory(cat.key); setError('') }}
              className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                category === cat.key ? pillActive : pillInactive
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DEVISES FORM ── */}
      {category === 'devises' && (
        <form onSubmit={handleSubmitDevises} className="card backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <div>
            <label className="field-label">{t('type')}</label>
            <div className="grid grid-cols-2 gap-3">
              {[{val:'Sell', label:t('typeSell')}, {val:'Buy', label:t('typeBuy')}].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setForm(p => ({...p, type:opt.val}))}
                  className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                    form.type === opt.val ? pillActive : pillInactive
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('sellCurrency')}</label>
              <select
                value={form.sellCurrencyCode}
                onChange={e => {
                  const code = e.target.value
                  const matches = countries.filter(c => c.currencyCode === code)
                  setForm(p => ({
                    ...p,
                    sellCurrencyCode: code,
                    sellCountryCode: matches.length === 1 ? matches[0].code : '',
                  }))
                  setSelectedFromMethods([])
                }}
                required
                className="select"
              >
                <option value="" disabled>{t('selectCurrency')}</option>
                {sellCurrencies.map(c => <option key={c.code} value={c.code}>{c.code} — {locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">{t('buyCurrency')}</label>
              <select
                value={form.buyCurrencyCode}
                onChange={e => {
                  const code = e.target.value
                  const matches = countries.filter(c => c.currencyCode === code)
                  setForm(p => ({
                    ...p,
                    buyCurrencyCode: code,
                    buyCountryCode: matches.length === 1 ? matches[0].code : '',
                  }))
                  setSelectedToMethods([])
                }}
                required
                className="select"
              >
                <option value="" disabled>{t('selectCurrency')}</option>
                {buyCurrencies.map(c => <option key={c.code} value={c.code}>{c.code} — {locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('sellCountry')}</label>
              <select
                value={form.sellCountryCode}
                onChange={e => { setF('sellCountryCode')(e); setSelectedFromMethods([]) }}
                required
                className="select"
              >
                <option value="" disabled>{t('selectCountry')}</option>
                {sellCountries.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">{t('buyCountry')}</label>
              <select
                value={form.buyCountryCode}
                onChange={e => { setF('buyCountryCode')(e); setSelectedToMethods([]) }}
                required
                className="select"
              >
                <option value="" disabled>{t('selectCountry')}</option>
                {buyCountries.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('amount')}</label>
              <input type="number" value={form.amount} onChange={setF('amount')} required min="1" className="input" />
            </div>
            <div>
              <label className="field-label">{t('rate')}</label>
              <input type="number" value={form.rate} onChange={setF('rate')} required min="0.01" step="0.01" className="input" />
              <p className="text-xs text-muted-foreground mt-1.5">{t('rateHelp')}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('minAmount')}</label>
              <input type="number" value={form.minAmount} onChange={setF('minAmount')} required min="1" className="input" />
            </div>
            <div>
              <label className="field-label">{t('maxAmount')}</label>
              <input type="number" value={form.maxAmount} onChange={setF('maxAmount')} required min="1" className="input" />
            </div>
          </div>

          {sellMethods.length > 0 && (
            <div>
              <label className="field-label">{t('paymentMethods')} — {t('from')}</label>
              <div className="flex flex-wrap gap-2">
                {sellMethods.map(pm => (
                  <button key={pm.id} type="button" onClick={() => toggleMethod(pm.id, 'from')}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selectedFromMethods.includes(pm.id) ? pillActive : pillInactive
                    }`}>
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {buyMethods.length > 0 && (
            <div>
              <label className="field-label">{t('paymentMethods')} — {t('to')}</label>
              <div className="flex flex-wrap gap-2">
                {buyMethods.map(pm => (
                  <button key={pm.id} type="button" onClick={() => toggleMethod(pm.id, 'to')}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selectedToMethods.includes(pm.id) ? pillActive : pillInactive
                    }`}>
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('expiryHours')}</label>
              <select value={form.expiryHours} onChange={setF('expiryHours')} className="select">
                <option value="24">24h</option>
                <option value="48">48h</option>
                <option value="72">72h</option>
                <option value="168">7 {locale === 'fr' ? 'jours' : 'days'}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">{t('notes')}</label>
            <textarea value={form.notes} onChange={setF('notes')} rows={3} maxLength={500} className="input resize-none" />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">{error}</div>}
          <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none">
            {isPending ? '...' : t('submit')}
          </button>
        </form>
      )}

      {/* ── TRAVEL KILO FORM ── */}
      {category === 'kilos' && (
        <form onSubmit={handleSubmitTravelKilo} className="card backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('departureCountry')}</label>
              <select value={tkForm.departureCountryCode} onChange={setTk('departureCountryCode')} required className="select">
                <option value="">{t('selectCountry')}</option>
                {countries.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">{t('departureCity')}</label>
              <input type="text" value={tkForm.departureCity} onChange={setTk('departureCity')} required maxLength={100} className="input" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('destinationCountry')}</label>
              <select value={tkForm.destinationCountryCode} onChange={setTk('destinationCountryCode')} required className="select">
                <option value="">{t('selectCountry')}</option>
                {countries.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">{t('destinationCity')}</label>
              <input type="text" value={tkForm.destinationCity} onChange={setTk('destinationCity')} required maxLength={100} className="input" />
            </div>
          </div>

          <div>
            <label className="field-label">{t('travelDate')}</label>
            <input type="date" value={tkForm.travelDate} onChange={setTk('travelDate')} required
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className="input" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('availableKg')}</label>
              <input type="number" value={tkForm.availableKg} onChange={setTk('availableKg')} required min="0.1" max="500" step="0.1" className="input" />
            </div>
            <div>
              <label className="field-label">{t('pricePerKg')}</label>
              <input type="number" value={tkForm.pricePerKg} onChange={setTk('pricePerKg')} required min="0.01" step="0.01" className="input" />
            </div>
          </div>

          <div>
            <label className="field-label">{t('notes')}</label>
            <textarea value={tkForm.notes} onChange={setTk('notes')} rows={3} maxLength={500} className="input resize-none" />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">{error}</div>}
          <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none">
            {isPending ? '...' : t('submit')}
          </button>
        </form>
      )}

      {/* ── BOAT SHIPPING FORM ── */}
      {category === 'bateau' && (
        <form onSubmit={handleSubmitBoatShipping} className="card backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('departureCountry')}</label>
              <select value={bsForm.departureCountryCode} onChange={setBs('departureCountryCode')} required className="select">
                <option value="">{t('selectCountry')}</option>
                {countries.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">{t('departurePort')}</label>
              <input type="text" value={bsForm.departurePort} onChange={setBs('departurePort')} required maxLength={100} className="input" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('destinationCountry')}</label>
              <select value={bsForm.destinationCountryCode} onChange={setBs('destinationCountryCode')} required className="select">
                <option value="">{t('selectCountry')}</option>
                {countries.map(c => <option key={c.code} value={c.code}>{locale==='fr'?c.nameFr:c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">{t('destinationPort')}</label>
              <input type="text" value={bsForm.destinationPort} onChange={setBs('destinationPort')} required maxLength={100} className="input" />
            </div>
          </div>

          <div>
            <label className="field-label">{t('shipDepartureDate')}</label>
            <input type="date" value={bsForm.shipDepartureDate} onChange={setBs('shipDepartureDate')} required
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className="input" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('availableLbs')}</label>
              <input type="number" value={bsForm.availableLbs} onChange={setBs('availableLbs')} required min="0.1" step="0.1" className="input" />
            </div>
            <div>
              <label className="field-label">{t('pricePerLb')}</label>
              <input type="number" value={bsForm.pricePerLb} onChange={setBs('pricePerLb')} required min="0.01" step="0.01" className="input" />
            </div>
          </div>

          <div>
            <label className="field-label">{t('notes')}</label>
            <textarea value={bsForm.notes} onChange={setBs('notes')} rows={3} maxLength={500} className="input resize-none" />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">{error}</div>}
          <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none">
            {isPending ? '...' : t('submit')}
          </button>
        </form>
      )}
    </div>
  )
}
