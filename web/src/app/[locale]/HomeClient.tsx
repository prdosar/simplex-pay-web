'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { flagUrl } from '@/lib/utils'
import { useMarketplaceRealtime } from '@/lib/useMarketplaceRealtime'
import { useCountries } from '@/lib/useCountries'
import OfferCard from '@/components/offers/OfferCard'
import TravelKiloCard from '@/components/offers/TravelKiloCard'
import BoatShippingCard from '@/components/offers/BoatShippingCard'
import CountrySelect from '@/components/ui/CountrySelect'
import type { PagedResult, OfferDto, CountryDto, PaymentMethodFacet, TravelKiloOfferDto, BoatShippingOfferDto } from '@/types/api'

type Tab = 'devises' | 'kilos' | 'bateau'
type SortOption = 'recent' | 'rate_desc' | 'rate_asc' | 'amount_desc'
type SortOptionTk = 'recent' | 'price_asc' | 'price_desc' | 'kg_desc'
type SortOptionBs = 'recent' | 'price_asc' | 'price_desc' | 'lbs_desc'

const SORT_KEYS: SortOption[] = ['recent', 'rate_desc', 'rate_asc', 'amount_desc']
const SORT_KEYS_TK: SortOptionTk[] = ['recent', 'price_asc', 'price_desc', 'kg_desc']
const SORT_KEYS_BS: SortOptionBs[] = ['recent', 'price_asc', 'price_desc', 'lbs_desc']

export default function HomeClient({ locale }: { locale: string }) {
  const t = useTranslations('home')
  const tOffers = useTranslations('offers')
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()

  const [activeTab, setActiveTab] = useState<Tab>('devises')

  // ── Devises state ──
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [sellCountry, setSellCountry] = useState('')
  const [checkedPaymentMethods, setCheckedPaymentMethods] = useState<Set<string>>(new Set())
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [sort, setSort] = useState<SortOption>('recent')
  const [page, setPage] = useState(1)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // ── TravelKilo state ──
  const [tkDeptCC, setTkDeptCC] = useState('')
  const [tkDestCC, setTkDestCC] = useState('')
  const [tkSearchDraft, setTkSearchDraft] = useState('')
  const [tkSearch, setTkSearch] = useState('')
  const [tkMinKg, setTkMinKg] = useState('')
  const [tkMaxKg, setTkMaxKg] = useState('')
  const [tkSort, setTkSort] = useState<SortOptionTk>('recent')
  const [tkPage, setTkPage] = useState(1)

  // ── BoatShipping state ──
  const [bsDeptCC, setBsDeptCC] = useState('')
  const [bsDestCC, setBsDestCC] = useState('')
  const [bsSearchDraft, setBsSearchDraft] = useState('')
  const [bsSearch, setBsSearch] = useState('')
  const [bsMinLbs, setBsMinLbs] = useState('')
  const [bsMaxLbs, setBsMaxLbs] = useState('')
  const [bsSort, setBsSort] = useState<SortOptionBs>('recent')
  const [bsPage, setBsPage] = useState(1)

  // ── Filtres confiance partagés (Devises + Kilos + Fret) ──
  const [trustVerifiedOnly, setTrustVerifiedOnly] = useState(false)
  const [trustMinRating, setTrustMinRating] = useState(0) // 0 = pas de filtre, 1-5 = min étoiles

  function updateTrustVerified(v: boolean) {
    setTrustVerifiedOnly(v); setPage(1); setTkPage(1); setBsPage(1)
  }
  function updateTrustRating(n: number) {
    // Re-clic sur la même étoile → clear
    setTrustMinRating(prev => prev === n ? 0 : n)
    setPage(1); setTkPage(1); setBsPage(1)
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchDraft); setPage(1) }, 350)
    return () => clearTimeout(timer)
  }, [searchDraft])
  useEffect(() => {
    const timer = setTimeout(() => { setTkSearch(tkSearchDraft); setTkPage(1) }, 350)
    return () => clearTimeout(timer)
  }, [tkSearchDraft])
  useEffect(() => {
    const timer = setTimeout(() => { setBsSearch(bsSearchDraft); setBsPage(1) }, 350)
    return () => clearTimeout(timer)
  }, [bsSearchDraft])

  const { data: countries } = useCountries()

  // Compteurs globaux (toutes offres actives, sans filtres user) — pour les badges d'onglets.
  const { data: devisesTotal } = useSWR<PagedResult<OfferDto>>(
    '/api/offers?pageSize=1',
    (url: string) => api.get<PagedResult<OfferDto>>(url)
  )
  const { data: kilosTotal } = useSWR<PagedResult<TravelKiloOfferDto>>(
    '/api/travel-kilo?pageSize=1',
    (url: string) => api.get<PagedResult<TravelKiloOfferDto>>(url)
  )
  const { data: bateauTotal } = useSWR<PagedResult<BoatShippingOfferDto>>(
    '/api/boat-shipping?pageSize=1',
    (url: string) => api.get<PagedResult<BoatShippingOfferDto>>(url)
  )

  const sellCountries = countries?.filter(c => c.currencyType === 'Sell') ?? []
  const selectedCountry = countries?.find(c => c.code === sellCountry)
  const paymentMethods = selectedCountry?.paymentMethods ?? []

  useEffect(() => {
    if (!countries || authLoading) return
    // Défaut « tous les pays » sauf si l'utilisateur connecté a défini son pays.
    // Devises: applique user.country si c'est un pays vendeur valide, sinon reste vide.
    if (user?.country && !sellCountry) {
      const preferred = sellCountries.find(c => c.code === user.country)
      if (preferred) setSellCountry(preferred.code)
    }
    // Kilos & Fret: applique user.country comme pays de départ (destination reste vide).
    if (user?.country && countries.some(c => c.code === user.country)) {
      if (!tkDeptCC) setTkDeptCC(user.country)
      if (!bsDeptCC) setBsDeptCC(user.country)
    }
  }, [countries, user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  function buildFacetsQuery() {
    const p = new URLSearchParams()
    if (sellCountry) p.set('sellCountryCode', sellCountry)
    if (search) p.set('search', search)
    if (minAmount) p.set('minAmount', minAmount)
    if (maxAmount) p.set('maxAmount', maxAmount)
    return p.toString()
  }

  const { data: facets } = useSWR<PaymentMethodFacet[]>(
    activeTab === 'devises' && sellCountry ? `/api/offers/facets/payment-methods?${buildFacetsQuery()}` : null,
    (url: string) => api.get<PaymentMethodFacet[]>(url)
  )

  function buildDevisesQuery() {
    const p = new URLSearchParams()
    if (sellCountry) p.set('sellCountryCode', sellCountry)
    checkedPaymentMethods.forEach(id => p.append('paymentMethodIds', id))
    if (search) p.set('search', search)
    if (minAmount) p.set('minAmount', minAmount)
    if (maxAmount) p.set('maxAmount', maxAmount)
    if (sort === 'rate_desc')   { p.set('sortBy', 'rate');   p.set('sortDir', 'desc') }
    if (sort === 'rate_asc')    { p.set('sortBy', 'rate');   p.set('sortDir', 'asc') }
    if (sort === 'amount_desc') { p.set('sortBy', 'amount'); p.set('sortDir', 'desc') }
    if (trustVerifiedOnly) p.set('verifiedOnly', 'true')
    if (trustMinRating > 0) p.set('minRating', String(trustMinRating))
    p.set('page', String(page))
    p.set('pageSize', '12')
    return p.toString()
  }

  const { data: devisesData, isLoading: devisesLoading } = useSWR<PagedResult<OfferDto>>(
    activeTab === 'devises' ? `/api/offers?${buildDevisesQuery()}` : null,
    (url: string) => api.get<PagedResult<OfferDto>>(url)
  )

  function buildTkQuery() {
    const p = new URLSearchParams()
    if (tkDeptCC) p.set('departureCountryCode', tkDeptCC)
    if (tkDestCC) p.set('destinationCountryCode', tkDestCC)
    if (tkSearch) p.set('search', tkSearch)
    if (tkMinKg) p.set('minKg', tkMinKg)
    if (tkMaxKg) p.set('maxKg', tkMaxKg)
    if (tkSort === 'price_asc')  { p.set('sortBy', 'price'); p.set('sortDir', 'asc') }
    if (tkSort === 'price_desc') { p.set('sortBy', 'price'); p.set('sortDir', 'desc') }
    if (tkSort === 'kg_desc')    { p.set('sortBy', 'kg') }
    if (trustVerifiedOnly) p.set('verifiedOnly', 'true')
    if (trustMinRating > 0) p.set('minRating', String(trustMinRating))
    p.set('page', String(tkPage))
    p.set('pageSize', '12')
    return p.toString()
  }

  const { data: tkData, isLoading: tkLoading } = useSWR<PagedResult<TravelKiloOfferDto>>(
    activeTab === 'kilos' ? `/api/travel-kilo?${buildTkQuery()}` : null,
    (url: string) => api.get<PagedResult<TravelKiloOfferDto>>(url)
  )

  function buildBsQuery() {
    const p = new URLSearchParams()
    if (bsDeptCC) p.set('departureCountryCode', bsDeptCC)
    if (bsDestCC) p.set('destinationCountryCode', bsDestCC)
    if (bsSearch) p.set('search', bsSearch)
    if (bsMinLbs) p.set('minLbs', bsMinLbs)
    if (bsMaxLbs) p.set('maxLbs', bsMaxLbs)
    if (bsSort === 'price_asc')  { p.set('sortBy', 'price'); p.set('sortDir', 'asc') }
    if (bsSort === 'price_desc') { p.set('sortBy', 'price'); p.set('sortDir', 'desc') }
    if (bsSort === 'lbs_desc')   { p.set('sortBy', 'lbs') }
    if (trustVerifiedOnly) p.set('verifiedOnly', 'true')
    if (trustMinRating > 0) p.set('minRating', String(trustMinRating))
    p.set('page', String(bsPage))
    p.set('pageSize', '12')
    return p.toString()
  }

  const { data: bsData, isLoading: bsLoading } = useSWR<PagedResult<BoatShippingOfferDto>>(
    activeTab === 'bateau' ? `/api/boat-shipping?${buildBsQuery()}` : null,
    (url: string) => api.get<PagedResult<BoatShippingOfferDto>>(url)
  )

  function handleCountryChange(code: string) {
    setSellCountry(code)
    setCheckedPaymentMethods(new Set())
    setPage(1)
  }

  function resetFilters() {
    setCheckedPaymentMethods(new Set())
    setMinAmount('')
    setMaxAmount('')
    setSearchDraft('')
    setSearch('')
    setSort('recent')
    setTrustVerifiedOnly(false)
    setTrustMinRating(0)
    setPage(1)
  }

  function togglePaymentMethod(id: string) {
    setCheckedPaymentMethods(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setPage(1)
  }

  const sortLabels: Record<SortOption, string> = {
    recent:      t('offers.sortRecent'),
    rate_desc:   t('offers.sortRateDesc'),
    rate_asc:    t('offers.sortRateAsc'),
    amount_desc: t('offers.sortAmountDesc'),
  }

  const tkSortLabels: Record<SortOptionTk, string> = {
    recent:     t('travelKilo.sortRecent'),
    price_asc:  t('travelKilo.sortPriceAsc'),
    price_desc: t('travelKilo.sortPriceDesc'),
    kg_desc:    t('travelKilo.sortKgDesc'),
  }

  const bsSortLabels: Record<SortOptionBs, string> = {
    recent:     t('boatShipping.sortRecent'),
    price_asc:  t('boatShipping.sortPriceAsc'),
    price_desc: t('boatShipping.sortPriceDesc'),
    lbs_desc:   t('boatShipping.sortLbsDesc'),
  }

  const trustActiveCount = (trustVerifiedOnly ? 1 : 0) + (trustMinRating > 0 ? 1 : 0)

  const activeCount = [minAmount || maxAmount, search].filter(Boolean).length
    + (sort !== 'recent' ? 1 : 0) + checkedPaymentMethods.size + trustActiveCount

  const tkActiveCount = [tkMinKg || tkMaxKg, tkSearch].filter(Boolean).length
    + (tkSort !== 'recent' ? 1 : 0) + trustActiveCount
  const bsActiveCount = [bsMinLbs || bsMaxLbs, bsSearch].filter(Boolean).length
    + (bsSort !== 'recent' ? 1 : 0) + trustActiveCount

  function resetTkFilters() {
    setTkMinKg(''); setTkMaxKg(''); setTkSearchDraft(''); setTkSearch(''); setTkSort('recent')
    setTrustVerifiedOnly(false); setTrustMinRating(0); setTkPage(1)
  }
  function resetBsFilters() {
    setBsMinLbs(''); setBsMaxLbs(''); setBsSearchDraft(''); setBsSearch(''); setBsSort('recent')
    setTrustVerifiedOnly(false); setTrustMinRating(0); setBsPage(1)
  }

  useEffect(() => {
    function onResize() { if (window.innerWidth >= 1024) setMobileSidebarOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Temps réel : à chaque nouvelle offre pushée par le hub, revalider les listes
  // de la catégorie concernée + son compteur d'onglet (mais aussi les 2 autres
  // compteurs si l'user a plusieurs onglets ouverts d'affilée).
  useMarketplaceRealtime(({ category }) => {
    // Compteurs (URL exacte que SWR utilise)
    if (category === 'devises') globalMutate('/api/offers?pageSize=1')
    if (category === 'kilos')   globalMutate('/api/travel-kilo?pageSize=1')
    if (category === 'bateau')  globalMutate('/api/boat-shipping?pageSize=1')
    // Listes actives : revalider toute clé qui commence par l'URL de base.
    globalMutate((key: string | null | undefined) => {
      if (typeof key !== 'string') return false
      if (category === 'devises') return key.startsWith('/api/offers?')
      if (category === 'kilos')   return key.startsWith('/api/travel-kilo?')
      if (category === 'bateau')  return key.startsWith('/api/boat-shipping?')
      return false
    })
  })

  // Bloc filtres confiance (certifié + min étoiles) — partagé par les 3 onglets.
  const trustFilterBlock = (
    <div className="space-y-4 pb-4 border-b" style={{ borderColor: '#f1f5f9' }}>
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
          {t('trust.label')}
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={trustVerifiedOnly}
            onChange={e => updateTrustVerified(e.target.checked)}
            className="w-4 h-4 accent-[#0d9488]"
          />
          <span className="text-sm group-hover:text-[#0d9488]" style={{ color: '#334155' }}>
            {t('trust.verifiedOnly')}
          </span>
        </label>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
          {t('trust.minRating')}
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => updateTrustRating(n)}
              aria-label={t('trust.minRatingAria', { n })}
              className="text-2xl leading-none transition-transform hover:scale-110"
              style={{ color: n <= trustMinRating ? '#f59e0b' : '#e2e8f0' }}
            >★</button>
          ))}
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: trustMinRating > 0 ? '#0d9488' : '#94a3b8' }}>
          {trustMinRating > 0 ? t('trust.minRatingValue', { n: trustMinRating }) : t('trust.noRatingFilter')}
        </p>
      </div>
    </div>
  )

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'devises', label: t('tabs.devises'),      count: devisesTotal?.total },
    { key: 'kilos',   label: t('tabs.kilosVoyage'), count: kilosTotal?.total },
    { key: 'bateau',  label: t('tabs.fretBateau'),  count: bateauTotal?.total },
  ]

  function renderPagination(currentPage: number, totalPages: number, setPageFn: (p: number) => void) {
    if (totalPages <= 1) return null
    return (
      <div className="flex justify-center gap-2 mt-10">
        <button
          onClick={() => setPageFn(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-30"
          style={{ borderColor: '#e2e8f0', color: '#64748b' }}
        >←</button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = totalPages <= 7 ? i + 1
            : currentPage <= 4 ? i + 1
            : currentPage >= totalPages - 3 ? totalPages - 6 + i
            : currentPage - 3 + i
          return (
            <button
              key={p}
              onClick={() => setPageFn(p)}
              className="w-9 h-9 rounded-lg text-sm font-medium transition-colors border"
              style={{
                background: p === currentPage ? '#0d9488' : 'white',
                color: p === currentPage ? 'white' : '#64748b',
                borderColor: p === currentPage ? '#0d9488' : '#e2e8f0',
              }}
            >{p}</button>
          )
        })}
        <button
          onClick={() => setPageFn(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-30"
          style={{ borderColor: '#e2e8f0', color: '#64748b' }}
        >→</button>
      </div>
    )
  }

  function renderSkeletons() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e2e8f0] rounded-2xl h-[220px] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div style={{ background: '#ffffff', color: '#0f172a' }}>

      {/* ── HERO ── */}
      <section className="max-w-[1200px] mx-auto px-6 pt-[80px] pb-[100px] flex flex-col lg:flex-row items-center gap-16">
        {/* Left: text */}
        <div className="flex-1 min-w-0">
          <p className="inline-block text-xs font-bold tracking-[0.08em] uppercase mb-5 px-3 py-1.5 rounded-full"
             style={{ color: '#0f766e', background: '#ccfbf1' }}>
            {t('hero.badge')}
          </p>
          <h1 className="text-4xl lg:text-[52px] font-extrabold leading-[1.08] tracking-[-0.02em] mb-5" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {t('hero.title')}
          </h1>
          <p className="text-lg leading-relaxed mb-8 max-w-[520px]" style={{ color: '#475569' }}>
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-3.5 mb-9">
            <Link href={`#offres`}
              className="text-[15px] font-bold text-white px-7 py-3.5 rounded-xl transition-colors"
              style={{ background: '#0d9488' }}
            >
              {t('hero.ctaView')}
            </Link>
            <Link href={`/${locale}/creer-offre`}
              className="text-[15px] font-bold px-7 py-3.5 rounded-xl border-[1.5px] transition-colors hover:border-[#0d9488]"
              style={{ color: '#0f172a', borderColor: '#e2e8f0' }}
            >
              {t('hero.ctaPost')}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([t('hero.trust1'), t('hero.trust3')] as string[]).map((pt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                      style={{ background: '#ccfbf1', color: '#0f766e' }}>✓</span>
                <span className="text-sm font-medium" style={{ color: '#334155' }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: diaspora illustration */}
        <div className="flex-1 flex justify-center items-center w-full lg:min-w-[380px] max-w-[520px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-diaspora.webp"
            alt=""
            aria-hidden="true"
            className="w-full max-w-[460px] h-auto object-contain select-none"
            draggable={false}
          />
        </div>
      </section>


      {/* ── DISCLAIMER ── */}
      <section className="px-6 pb-10">
        <div
          className="max-w-[1200px] mx-auto rounded-2xl p-5 sm:p-6 flex gap-4"
          style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}
          role="note"
        >
          <div
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-extrabold"
            style={{ background: '#fbbf24', color: '#78350f' }}
            aria-hidden="true"
          >
            !
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold mb-1" style={{ color: '#78350f' }}>
              {t('disclaimer.title')}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#92400e' }}>
              {t('disclaimer.body')}
            </p>
          </div>
        </div>
      </section>


      {/* ── OFFERS ── */}
      <section id="offres" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }} className="py-[88px] px-6">
        <div className="max-w-[1200px] mx-auto">

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-[34px] font-extrabold mb-2 tracking-[-0.01em]">
              {activeTab === 'devises' ? t('offers.sectionTitle')
               : activeTab === 'kilos' ? t('travelKilo.sectionTitle')
               : t('boatShipping.sectionTitle')}
            </h2>
            <p className="text-[15px]" style={{ color: '#64748b' }}>
              {activeTab === 'devises' ? t('offers.sectionSubtitle')
               : activeTab === 'kilos' ? t('travelKilo.sectionSubtitle')
               : t('boatShipping.sectionSubtitle')}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2"
                style={{
                  background: activeTab === tab.key ? '#0d9488' : 'white',
                  color: activeTab === tab.key ? 'white' : '#64748b',
                  border: activeTab === tab.key ? '1.5px solid #0d9488' : '1.5px solid #e2e8f0',
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className="text-[11px] font-bold px-1.5 py-[1px] rounded-full min-w-[20px] text-center"
                    style={{
                      background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: activeTab === tab.key ? 'white' : '#0d9488',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── DEVISES TAB ── */}
          {activeTab === 'devises' && (
            <>
              {/* Search bar + result count */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <button
                  onClick={() => setMobileSidebarOpen(v => !v)}
                  className="lg:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    borderColor: mobileSidebarOpen || activeCount > 0 ? '#0d9488' : '#e2e8f0',
                    background: mobileSidebarOpen || activeCount > 0 ? '#ccfbf1' : 'white',
                    color: mobileSidebarOpen || activeCount > 0 ? '#0d9488' : '#0f172a',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  {activeCount > 0 && (
                    <span className="text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center" style={{ background: '#0d9488' }}>{activeCount}</span>
                  )}
                </button>

                <div className="flex-1 min-w-[240px] relative flex items-center">
                  <svg className="absolute left-3.5 w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchDraft}
                    onChange={e => setSearchDraft(e.target.value)}
                    placeholder={t('offers.searchPlaceholder')}
                    className="w-full py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] rounded-[10px] border border-[#e2e8f0] bg-white"
                    style={{ paddingLeft: '38px', paddingRight: selectedCountry ? '160px' : '16px' }}
                  />
                  {selectedCountry && (
                    <div className="absolute right-2 flex items-center gap-1.5 text-xs font-bold px-2.5 py-[5px] rounded-lg"
                         style={{ background: '#ccfbf1', color: '#0f766e' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flagUrl(selectedCountry.code)} alt={selectedCountry.code} className="w-[18px] h-[13px] rounded-sm object-cover shrink-0" />
                      <span className="hidden sm:inline">{locale === 'fr' ? selectedCountry.nameFr : selectedCountry.name}</span>
                      <span>· {selectedCountry.currencyCode}</span>
                    </div>
                  )}
                </div>

                {devisesData !== undefined && (
                  <span className="text-sm whitespace-nowrap shrink-0" style={{ color: '#64748b' }}>
                    {t('offers.resultCount', { count: devisesData.total })}
                  </span>
                )}
              </div>

              <div className="flex gap-6 items-start">
                {/* Sidebar */}
                <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-[260px] shrink-0 lg:sticky lg:top-[88px]`}>
                  <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('offers.countryLabel')}
                      </label>
                      <CountrySelect
                        value={sellCountry}
                        onChange={handleCountryChange}
                        countries={sellCountries}
                        locale={locale}
                        emptyLabel={t('offers.allCountries')}
                        showCurrencyCode
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('offers.sortLabel')}
                      </label>
                      <select
                        value={sort}
                        onChange={e => { setSort(e.target.value as SortOption); setPage(1) }}
                        className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      >
                        {SORT_KEYS.map(key => (
                          <option key={key} value={key}>{sortLabels[key]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('offers.paymentLabel')}
                      </label>
                      {paymentMethods.length === 0 ? (
                        <p className="text-sm italic" style={{ color: '#94a3b8' }}>{t('offers.selectCountry')}</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {paymentMethods.map(pm => {
                            const facet = facets?.find(f => f.id === pm.id)
                            const count = facet?.count ?? 0
                            const checked = checkedPaymentMethods.has(pm.id)
                            return (
                              <label
                                key={pm.id}
                                className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-sm"
                                style={{
                                  background: checked ? '#ccfbf1' : 'transparent',
                                  opacity: count === 0 && !checked ? 0.4 : 1,
                                  cursor: count === 0 && !checked ? 'default' : 'pointer',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={count === 0 && !checked}
                                  onChange={() => togglePaymentMethod(pm.id)}
                                  className="rounded shrink-0"
                                  style={{ accentColor: '#0d9488' }}
                                />
                                {pm.isPopular && <span className="text-amber-400 text-xs shrink-0">★</span>}
                                <span className="flex-1 truncate font-medium" style={{ color: checked ? '#0f766e' : '#334155' }}>
                                  {pm.name}
                                </span>
                                <span className="text-xs shrink-0" style={{ color: '#94a3b8' }}>({count})</span>
                              </label>
                            )
                          })}
                          {checkedPaymentMethods.size > 0 && (
                            <button
                              onClick={() => { setCheckedPaymentMethods(new Set()); setPage(1) }}
                              className="text-left px-2.5 py-1 text-xs mt-0.5 transition-colors"
                              style={{ color: '#94a3b8' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              {t('offers.clearSelection')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('offers.amountLabel')}
                      </label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Min"
                          value={minAmount}
                          onChange={e => { setMinAmount(e.target.value); setPage(1) }}
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder="Max"
                          value={maxAmount}
                          onChange={e => { setMaxAmount(e.target.value); setPage(1) }}
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                      </div>
                    </div>

                    {trustFilterBlock}

                    {activeCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="w-full py-2.5 rounded-lg border text-xs font-semibold transition-colors"
                        style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                      >
                        {t('offers.clearFilters', { count: activeCount })}
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 min-w-0">
                  {devisesLoading ? renderSkeletons() : devisesData?.items.length === 0 ? (
                    <div className="text-center py-16" style={{ color: '#64748b' }}>
                      <p className="text-base mb-3">{tOffers('empty')}</p>
                      {activeCount > 0 && (
                        <button onClick={resetFilters} className="text-sm font-bold hover:underline" style={{ color: '#0d9488' }}>
                          {t('offers.clearFilters', { count: activeCount })}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {devisesData?.items.map(offer => (
                          <OfferCard key={offer.id} offer={offer} isAuthenticated={isAuthenticated} locale={locale} />
                        ))}
                      </div>
                      {devisesData && renderPagination(page, devisesData.totalPages, setPage)}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── TRAVEL KILO TAB ── */}
          {activeTab === 'kilos' && (
            <>
              {/* Search bar + result count */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <button
                  onClick={() => setMobileSidebarOpen(v => !v)}
                  className="lg:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    borderColor: mobileSidebarOpen || tkActiveCount > 0 ? '#0d9488' : '#e2e8f0',
                    background: mobileSidebarOpen || tkActiveCount > 0 ? '#ccfbf1' : 'white',
                    color: mobileSidebarOpen || tkActiveCount > 0 ? '#0d9488' : '#0f172a',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  {tkActiveCount > 0 && (
                    <span className="text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center" style={{ background: '#0d9488' }}>{tkActiveCount}</span>
                  )}
                </button>

                <div className="flex-1 min-w-[240px] relative flex items-center">
                  <svg className="absolute left-3.5 w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={tkSearchDraft}
                    onChange={e => setTkSearchDraft(e.target.value)}
                    placeholder={t('travelKilo.searchPlaceholder')}
                    className="w-full py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] rounded-[10px] border border-[#e2e8f0] bg-white"
                    style={{ paddingLeft: '38px', paddingRight: '16px' }}
                  />
                </div>

                {tkData !== undefined && (
                  <span className="text-sm whitespace-nowrap shrink-0" style={{ color: '#64748b' }}>
                    {t('travelKilo.resultCount', { count: tkData.total })}
                  </span>
                )}
              </div>

              <div className="flex gap-6 items-start">
                {/* Sidebar */}
                <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-[260px] shrink-0 lg:sticky lg:top-[88px]`}>
                  <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('travelKilo.departureLabel')}
                      </label>
                      <CountrySelect
                        value={tkDeptCC}
                        onChange={code => { setTkDeptCC(code); setTkPage(1) }}
                        countries={countries ?? []}
                        locale={locale}
                        emptyLabel={t('travelKilo.allCountries')}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('travelKilo.destinationLabel')}
                      </label>
                      <CountrySelect
                        value={tkDestCC}
                        onChange={code => { setTkDestCC(code); setTkPage(1) }}
                        countries={countries ?? []}
                        locale={locale}
                        emptyLabel={t('travelKilo.allCountries')}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('travelKilo.sortLabel')}
                      </label>
                      <select
                        value={tkSort}
                        onChange={e => { setTkSort(e.target.value as SortOptionTk); setTkPage(1) }}
                        className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      >
                        {SORT_KEYS_TK.map(key => (
                          <option key={key} value={key}>{tkSortLabels[key]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('travelKilo.kgLabel')}
                      </label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Min"
                          value={tkMinKg}
                          onChange={e => { setTkMinKg(e.target.value); setTkPage(1) }}
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder="Max"
                          value={tkMaxKg}
                          onChange={e => { setTkMaxKg(e.target.value); setTkPage(1) }}
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                      </div>
                    </div>

                    {trustFilterBlock}

                    {tkActiveCount > 0 && (
                      <button
                        onClick={resetTkFilters}
                        className="w-full py-2.5 rounded-lg border text-xs font-semibold transition-colors"
                        style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                      >
                        {t('offers.clearFilters', { count: tkActiveCount })}
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 min-w-0">
                  {tkLoading ? renderSkeletons() : tkData?.items.length === 0 ? (
                    <div className="text-center py-16" style={{ color: '#64748b' }}>
                      <p className="text-base mb-3">{t('travelKilo.empty')}</p>
                      {tkActiveCount > 0 && (
                        <button onClick={resetTkFilters} className="text-sm font-bold hover:underline" style={{ color: '#0d9488' }}>
                          {t('offers.clearFilters', { count: tkActiveCount })}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {tkData?.items.map(offer => (
                          <TravelKiloCard key={offer.id} offer={offer} isAuthenticated={isAuthenticated} locale={locale} />
                        ))}
                      </div>
                      {tkData && renderPagination(tkPage, tkData.totalPages, setTkPage)}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── BOAT SHIPPING TAB ── */}
          {activeTab === 'bateau' && (
            <>
              {/* Search bar + result count */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <button
                  onClick={() => setMobileSidebarOpen(v => !v)}
                  className="lg:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    borderColor: mobileSidebarOpen || bsActiveCount > 0 ? '#0d9488' : '#e2e8f0',
                    background: mobileSidebarOpen || bsActiveCount > 0 ? '#ccfbf1' : 'white',
                    color: mobileSidebarOpen || bsActiveCount > 0 ? '#0d9488' : '#0f172a',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  {bsActiveCount > 0 && (
                    <span className="text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center" style={{ background: '#0d9488' }}>{bsActiveCount}</span>
                  )}
                </button>

                <div className="flex-1 min-w-[240px] relative flex items-center">
                  <svg className="absolute left-3.5 w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={bsSearchDraft}
                    onChange={e => setBsSearchDraft(e.target.value)}
                    placeholder={t('boatShipping.searchPlaceholder')}
                    className="w-full py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] rounded-[10px] border border-[#e2e8f0] bg-white"
                    style={{ paddingLeft: '38px', paddingRight: '16px' }}
                  />
                </div>

                {bsData !== undefined && (
                  <span className="text-sm whitespace-nowrap shrink-0" style={{ color: '#64748b' }}>
                    {t('boatShipping.resultCount', { count: bsData.total })}
                  </span>
                )}
              </div>

              <div className="flex gap-6 items-start">
                {/* Sidebar */}
                <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-[260px] shrink-0 lg:sticky lg:top-[88px]`}>
                  <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('boatShipping.departureLabel')}
                      </label>
                      <CountrySelect
                        value={bsDeptCC}
                        onChange={code => { setBsDeptCC(code); setBsPage(1) }}
                        countries={countries ?? []}
                        locale={locale}
                        emptyLabel={t('boatShipping.allCountries')}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('boatShipping.destinationLabel')}
                      </label>
                      <CountrySelect
                        value={bsDestCC}
                        onChange={code => { setBsDestCC(code); setBsPage(1) }}
                        countries={countries ?? []}
                        locale={locale}
                        emptyLabel={t('boatShipping.allCountries')}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('boatShipping.sortLabel')}
                      </label>
                      <select
                        value={bsSort}
                        onChange={e => { setBsSort(e.target.value as SortOptionBs); setBsPage(1) }}
                        className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      >
                        {SORT_KEYS_BS.map(key => (
                          <option key={key} value={key}>{bsSortLabels[key]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#64748b' }}>
                        {t('boatShipping.lbsLabel')}
                      </label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Min"
                          value={bsMinLbs}
                          onChange={e => { setBsMinLbs(e.target.value); setBsPage(1) }}
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder="Max"
                          value={bsMaxLbs}
                          onChange={e => { setBsMaxLbs(e.target.value); setBsPage(1) }}
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                      </div>
                    </div>

                    {trustFilterBlock}

                    {bsActiveCount > 0 && (
                      <button
                        onClick={resetBsFilters}
                        className="w-full py-2.5 rounded-lg border text-xs font-semibold transition-colors"
                        style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                      >
                        {t('offers.clearFilters', { count: bsActiveCount })}
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 min-w-0">
                  {bsLoading ? renderSkeletons() : bsData?.items.length === 0 ? (
                    <div className="text-center py-16" style={{ color: '#64748b' }}>
                      <p className="text-base mb-3">{t('boatShipping.empty')}</p>
                      {bsActiveCount > 0 && (
                        <button onClick={resetBsFilters} className="text-sm font-bold hover:underline" style={{ color: '#0d9488' }}>
                          {t('offers.clearFilters', { count: bsActiveCount })}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {bsData?.items.map(offer => (
                          <BoatShippingCard key={offer.id} offer={offer} isAuthenticated={isAuthenticated} locale={locale} />
                        ))}
                      </div>
                      {bsData && renderPagination(bsPage, bsData.totalPages, setBsPage)}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="comment-ca-marche" className="max-w-[1200px] mx-auto px-6 py-[88px]">
        <h2 className="text-[34px] font-extrabold text-center mb-14 tracking-[-0.01em]">{t('howItWorks.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {(['step1', 'step2', 'step3'] as const).map(key => (
            <div key={key} className="py-8 px-6 border border-[#e2e8f0] rounded-2xl">
              <div className="w-10 h-10 rounded-[10px] border-[1.5px] flex items-center justify-center text-[15px] font-extrabold mb-5"
                   style={{ borderColor: '#0d9488', color: '#0d9488' }}>
                {t(`howItWorks.${key}.num`)}
              </div>
              <h3 className="text-[19px] font-bold mb-2">{t(`howItWorks.${key}.title`)}</h3>
              <p className="text-[15px] leading-[1.55]" style={{ color: '#64748b' }}>{t(`howItWorks.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY SIMPLEXPAY ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-[88px]">
        <h2 className="text-[34px] font-extrabold text-center mb-14 tracking-[-0.01em]">{t('why.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(['p1', 'p2', 'p3', 'p4'] as const).map(key => (
            <div key={key}>
              <div className="w-9 h-9 rounded-lg mb-4" style={{ background: '#ccfbf1' }} />
              <h3 className="text-base font-bold mb-2">{t(`why.${key}.title`)}</h3>
              <p className="text-sm leading-[1.55]" style={{ color: '#64748b' }}>{t(`why.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-[72px] px-6 text-center" style={{ background: '#0f766e' }}>
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-[32px] font-extrabold text-white mb-3 tracking-[-0.01em]">{t('cta.title')}</h2>
          <p className="text-base mb-8" style={{ color: '#ccfbf1' }}>{t('cta.subtitle')}</p>
          <Link
            href={`/${locale}/auth/inscription`}
            className="inline-block text-[15px] font-bold px-8 py-3.5 rounded-xl transition-colors hover:bg-gray-50"
            style={{ color: '#0f766e', background: '#ffffff' }}
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>

    </div>
  )
}
