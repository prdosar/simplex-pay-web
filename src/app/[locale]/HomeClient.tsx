'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { flagUrl } from '@/lib/utils'
import OfferCard from '@/components/offers/OfferCard'
import TravelKiloCard from '@/components/offers/TravelKiloCard'
import BoatShippingCard from '@/components/offers/BoatShippingCard'
import {
  ArrowLeftRight,
  Plane,
  Ship,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ShieldCheck,
  Star,
  SearchX,
  UserPlus,
  Handshake,
  ArrowRight,
  Headset,
} from 'lucide-react'
import type {
  CountryDto,
  PagedResult,
  OfferDto,
  TravelKiloOfferDto,
  BoatShippingOfferDto,
} from '@/types/api'
import type { FacetRow, OfferSort } from '@/lib/queries'

export type Tab = 'devises' | 'kilos' | 'bateau'
type SortOption = OfferSort

export interface HomeFilters {
  sellCountry: string
  paymentMethodIds: string[]
  search: string
  minAmount?: string
  maxAmount?: string
  sort: SortOption
  page: number
  tkDeparture: string
  tkDestination: string
  tkSearch: string
  tkPage: number
  bsDeparture: string
  bsDestination: string
  bsSearch: string
  bsPage: number
}

export type HomeData =
  | { kind: 'devises'; offers: PagedResult<OfferDto>; facets: FacetRow[] }
  | { kind: 'kilos'; offers: PagedResult<TravelKiloOfferDto> }
  | { kind: 'bateau'; offers: PagedResult<BoatShippingOfferDto> }

const SORT_KEYS: SortOption[] = ['recent', 'rate_desc', 'rate_asc', 'amount_desc']

export default function HomeClient({
  locale,
  countries,
  activeTab,
  filters,
  data,
}: {
  locale: string
  countries: CountryDto[]
  activeTab: Tab
  filters: HomeFilters
  data: HomeData
}) {
  const t = useTranslations('home')
  const tOffers = useTranslations('offers')
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Local drafts for text/number inputs (debounced push to URL)
  const [searchDraft, setSearchDraft] = useState(filters.search)
  const [minDraft, setMinDraft] = useState(filters.minAmount ?? '')
  const [maxDraft, setMaxDraft] = useState(filters.maxAmount ?? '')
  useEffect(() => { setSearchDraft(filters.search) }, [filters.search])
  useEffect(() => { setMinDraft(filters.minAmount ?? '') }, [filters.minAmount])
  useEffect(() => { setMaxDraft(filters.maxAmount ?? '') }, [filters.maxAmount])

  function updateParams(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(searchParams.toString())
    mutate(p)
    startTransition(() => router.push(`?${p.toString()}`, { scroll: false }))
  }

  // Debounced search for devises
  useEffect(() => {
    if (activeTab !== 'devises') return
    if (searchDraft === filters.search) return
    const timer = setTimeout(() => {
      updateParams(p => {
        setSearchParam(p, 'q', searchDraft)
        p.delete('page')
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchDraft]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced amounts for devises
  useEffect(() => {
    if (activeTab !== 'devises') return
    if (minDraft === (filters.minAmount ?? '') && maxDraft === (filters.maxAmount ?? '')) return
    const timer = setTimeout(() => {
      updateParams(p => {
        setSearchParam(p, 'min', minDraft)
        setSearchParam(p, 'max', maxDraft)
        p.delete('page')
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [minDraft, maxDraft]) // eslint-disable-line react-hooks/exhaustive-deps

  function setSearchParam(p: URLSearchParams, key: string, value: string) {
    if (value) p.set(key, value)
    else p.delete(key)
  }

  function setTab(tab: Tab) {
    updateParams(p => { p.set('tab', tab) })
  }

  const sellCountries = countries.filter(c => c.currencyType === 'Sell')
  const selectedCountry = countries.find(c => c.code === filters.sellCountry)
  const allSellMethods = (() => {
    const byId = new Map<string, CountryDto['paymentMethods'][number]>()
    for (const c of sellCountries) for (const pm of c.paymentMethods) {
      if (!byId.has(pm.id)) byId.set(pm.id, pm)
    }
    return [...byId.values()].sort((a, b) =>
      Number(b.isPopular ?? false) - Number(a.isPopular ?? false) || a.name.localeCompare(b.name))
  })()
  const paymentMethods = selectedCountry?.paymentMethods ?? allSellMethods
  const facets = data.kind === 'devises' ? data.facets : []

  const devisesData = data.kind === 'devises' ? data.offers : undefined
  const tkData = data.kind === 'kilos' ? data.offers : undefined
  const bsData = data.kind === 'bateau' ? data.offers : undefined

  const isLoading = isPending

  // Local drafts for kilos / bateau searches
  const [tkSearchDraft, setTkSearchDraft] = useState(filters.tkSearch)
  const [bsSearchDraft, setBsSearchDraft] = useState(filters.bsSearch)
  useEffect(() => { setTkSearchDraft(filters.tkSearch) }, [filters.tkSearch])
  useEffect(() => { setBsSearchDraft(filters.bsSearch) }, [filters.bsSearch])

  useEffect(() => {
    if (activeTab !== 'kilos') return
    if (tkSearchDraft === filters.tkSearch) return
    const timer = setTimeout(() => {
      updateParams(p => {
        setSearchParam(p, 'tq', tkSearchDraft)
        p.delete('tkpage')
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [tkSearchDraft]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab !== 'bateau') return
    if (bsSearchDraft === filters.bsSearch) return
    const timer = setTimeout(() => {
      updateParams(p => {
        setSearchParam(p, 'bq', bsSearchDraft)
        p.delete('bspage')
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [bsSearchDraft]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCountryChange(code: string) {
    updateParams(p => {
      setSearchParam(p, 'country', code)
      p.delete('pm')
      p.delete('page')
    })
  }

  function handleSortChange(sort: SortOption) {
    updateParams(p => {
      if (sort === 'recent') p.delete('sort')
      else p.set('sort', sort)
      p.delete('page')
    })
  }

  function togglePaymentMethod(id: string) {
    const next = new Set(filters.paymentMethodIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    updateParams(p => {
      p.delete('pm')
      next.forEach(m => p.append('pm', m))
      p.delete('page')
    })
  }

  function clearPaymentMethods() {
    updateParams(p => { p.delete('pm'); p.delete('page') })
  }

  function resetFilters() {
    updateParams(p => {
      p.delete('pm')
      p.delete('q')
      p.delete('min')
      p.delete('max')
      p.delete('sort')
      p.delete('page')
    })
  }

  function updateRouteFilter(param: 'tkFrom' | 'tkTo' | 'bsFrom' | 'bsTo', value: string) {
    updateParams(p => {
      setSearchParam(p, param, value)
      p.delete(param.startsWith('tk') ? 'tkpage' : 'bspage')
    })
  }

  const sortLabels: Record<SortOption, string> = {
    recent:      t('offers.sortRecent'),
    rate_desc:   t('offers.sortRateDesc'),
    rate_asc:    t('offers.sortRateAsc'),
    amount_desc: t('offers.sortAmountDesc'),
  }

  const activeCount = [
    (filters.minAmount || filters.maxAmount) ? true : false,
    !!filters.search,
    filters.sort !== 'recent',
  ].filter(Boolean).length + filters.paymentMethodIds.length

  useEffect(() => {
    function onResize() { if (window.innerWidth >= 1024) setMobileSidebarOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const TABS: { key: Tab; label: string; icon: typeof ArrowLeftRight }[] = [
    { key: 'devises', label: t('tabs.devises'), icon: ArrowLeftRight },
    { key: 'kilos',   label: t('tabs.kilosVoyage'), icon: Plane },
    { key: 'bateau',  label: t('tabs.fretBateau'), icon: Ship },
  ]

  function renderPagination(paramName: string, currentPage: number, totalPages: number) {
    if (totalPages <= 1) return null
    function go(target: number) {
      updateParams(p => {
        if (target > 1) p.set(paramName, String(target))
        else p.delete(paramName)
      })
    }
    return (
      <div className="flex justify-center items-center gap-1.5 mt-12">
        <button
          onClick={() => go(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary-bright/50 hover:text-primary-bright transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const pg = totalPages <= 7 ? i + 1
            : currentPage <= 4 ? i + 1
            : currentPage >= totalPages - 3 ? totalPages - 6 + i
            : currentPage - 3 + i
          return (
            <button
              key={pg}
              onClick={() => go(pg)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                pg === currentPage
                  ? 'bg-gradient-to-b from-primary to-primary-deeper text-primary-foreground shadow-glow-teal'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary-bright/40 hover:text-primary-bright'
              }`}
            >
              {pg}
            </button>
          )
        })}
        <button
          onClick={() => go(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary-bright/50 hover:text-primary-bright transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  function renderSkeletons() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 h-[240px] animate-pulse" />
        ))}
      </div>
    )
  }

  function renderEmpty(message: string) {
    return (
      <div className="card flex flex-col items-center justify-center text-center py-16 px-6">
        <span className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground mb-4">
          <SearchX className="w-6 h-6" />
        </span>
        <p className="text-[15px] font-medium text-muted-foreground mb-4">{message}</p>
        {activeCount > 0 && (
          <button onClick={resetFilters} className="text-sm font-bold text-primary-bright hover:underline underline-offset-2">
            {t('offers.clearFilters', { count: activeCount })}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground">

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid mask-fade-radial" />
        <div className="aurora-orb -top-40 -left-32 w-[520px] h-[520px] bg-primary/25 animate-aurora" />
        <div className="aurora-orb top-10 -right-40 w-[560px] h-[560px] bg-indigo-600/20 animate-aurora" style={{ animationDelay: '-6s' }} />
        <div className="aurora-orb bottom-0 left-1/3 w-[420px] h-[300px] bg-secondary/15 animate-aurora" style={{ animationDelay: '-10s' }} />

        <div className="container-page relative grid lg:grid-cols-2 gap-14 lg:gap-8 items-center pt-14 pb-16 lg:pt-24 lg:pb-28">
          {/* Left : message */}
          <div>
            <p className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.1em] text-primary-bright border border-primary-bright/25 bg-primary-light rounded-full px-4 py-2 animate-fade-up">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-primary-bright opacity-60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-primary-bright" />
              </span>
              {t('hero.badge')}
            </p>

            <h1 className="text-balance text-[40px] sm:text-5xl lg:text-[58px] font-extrabold leading-[1.05] tracking-[-0.025em] text-foreground mt-6 mb-5 animate-fade-up-late">
              {t('hero.title')}
            </h1>

            <p className="text-lg leading-relaxed text-muted-foreground max-w-[520px] mb-8 animate-fade-up-late">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-3.5 mb-9 animate-fade-up-late2">
              <Link href="#offres" className="btn-primary">
                {t('hero.ctaView')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href={`/${locale}/creer-offre`} className="btn-outline">
                {t('hero.ctaPost')}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
              {([t('hero.trust1'), t('hero.trust2'), t('hero.trust3')] as string[]).map((pt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CircleCheck className="w-[18px] h-[18px] text-primary-bright shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">{pt}</span>
                </div>
              ))}
            </div>

            <div className="flex max-w-md divide-x divide-border">
              {([
                ['stats.servicesValue', 'stats.servicesLabel'],
                ['stats.feesValue', 'stats.feesLabel'],
                ['stats.p2pValue', 'stats.p2pLabel'],
              ] as const).map(([vKey, lKey], i) => (
                <div key={vKey} className={i === 0 ? 'pr-6' : 'px-6'}>
                  <p className="text-2xl font-extrabold text-foreground tracking-tight">{t(vKey)}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{t(lKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right : carte démo */}
          <div className="relative flex justify-center lg:justify-end animate-fade-up-late2">
            <div className="relative w-full max-w-[400px]">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/30 via-transparent to-secondary/20 rounded-[36px] blur-2xl" />

              <div className="relative rounded-[24px] border border-border bg-card backdrop-blur-2xl shadow-float overflow-hidden">
                <div className="hairline-top" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1.5 font-bold text-base text-foreground">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flagUrl('fr')} alt="FR" className="w-[22px] h-4 rounded-sm object-cover ring-1 ring-border" />
                      <span>EUR</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/70" strokeWidth={2.5} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flagUrl('tg')} alt="TG" className="w-[22px] h-4 rounded-sm object-cover ring-1 ring-border" />
                      <span>XOF</span>
                    </div>
                    <span className="badge-active">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-bright animate-pulse-dot" />
                      Active
                    </span>
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-1">
                    {tOffers('card.rate')}
                  </p>
                  <p className="text-[32px] font-extrabold text-primary-bright mb-5 tracking-tight">
                    655,96 <span className="text-sm font-semibold text-muted-foreground">XOF / EUR</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-muted border border-border/60 rounded-xl px-3.5 py-3 mb-5">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{tOffers('card.available')}</p>
                      <p className="text-[13px] font-bold text-foreground">500 000 XOF</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{tOffers('card.minMax')}</p>
                      <p className="text-[13px] font-bold text-foreground">50k – 500k</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-bright to-primary-deeper text-primary-foreground flex items-center justify-center text-xs font-extrabold">K</span>
                      <span className="text-sm font-bold text-foreground">Kossi</span>
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        4.8
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary-bright">{tOffers('card.contact')}</span>
                  </div>
                </div>
              </div>

              {/* Chips flottants */}
              <div className="absolute -left-5 lg:-left-12 top-8 animate-float">
                <div className="glass-strong flex items-center gap-2 rounded-xl px-3.5 py-2.5 shadow-pop">
                  <span className="w-7 h-7 rounded-lg bg-primary-light border border-primary-bright/25 text-primary-bright flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-foreground">{t('hero.cardSecure')}</span>
                </div>
              </div>
              <div className="absolute -right-3 lg:-right-10 bottom-10 animate-float-delay">
                <div className="glass-strong flex items-center gap-2 rounded-xl px-3.5 py-2.5 shadow-pop">
                  <span className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/25 text-amber-400 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-current" />
                  </span>
                  <span className="text-xs font-bold text-foreground">{t('hero.cardRated')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ OFFRES ══ */}
      <section id="offres" className="relative bg-section border-y border-border/40 py-20 px-5 sm:px-6">
        <div className="max-w-[1200px] mx-auto">

          {/* Heading + tabs */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <p className="eyebrow mb-3">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {t('offers.eyebrow')}
              </p>
              <h2 className="section-title">
                {activeTab === 'devises' ? t('offers.sectionTitle')
                 : activeTab === 'kilos' ? t('travelKilo.sectionTitle')
                 : t('boatShipping.sectionTitle')}
              </h2>
              <p className="section-subtitle">
                {activeTab === 'devises' ? t('offers.sectionSubtitle')
                 : activeTab === 'kilos' ? t('travelKilo.sectionSubtitle')
                 : t('boatShipping.sectionSubtitle')}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="inline-flex w-fit max-w-full overflow-x-auto glass rounded-xl p-1">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-b from-primary to-primary-deeper text-primary-foreground shadow-glow-teal'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── DEVISES TAB ── */}
          {activeTab === 'devises' && (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <button
                  onClick={() => setMobileSidebarOpen(v => !v)}
                  className={`lg:hidden shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                    mobileSidebarOpen || activeCount > 0
                      ? 'border-primary-bright/50 bg-primary-light text-primary-bright'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeCount > 0 && (
                    <span className="bg-primary-bright text-primary-foreground rounded-full w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </button>

                <div className="flex-1 min-w-[240px] relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchDraft}
                    onChange={e => setSearchDraft(e.target.value)}
                    placeholder={t('offers.searchPlaceholder')}
                    className="input !py-3 !rounded-xl pl-10"
                    style={{ paddingRight: selectedCountry ? '160px' : '16px' }}
                  />
                  {selectedCountry && (
                    <div className="absolute right-2 flex items-center gap-1.5 text-xs font-bold px-2.5 py-[5px] rounded-lg bg-primary-light border border-primary-bright/20 text-primary-bright">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flagUrl(selectedCountry.code)} alt={selectedCountry.code} className="w-[18px] h-[13px] rounded-sm object-cover shrink-0" />
                      <span className="hidden sm:inline">{locale === 'fr' ? selectedCountry.nameFr : selectedCountry.name}</span>
                      <span>· {selectedCountry.currencyCode}</span>
                    </div>
                  )}
                </div>

                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0">
                  {t('offers.resultCount', { count: devisesData?.total ?? 0 })}
                </span>
              </div>

              <div className="flex gap-6 items-start">
                {/* Sidebar */}
                <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-[268px] shrink-0 lg:sticky lg:top-[92px]`}>
                  <div className="card p-5 space-y-6 backdrop-blur-xl">
                    <div>
                      <label className="field-label">{t('offers.countryLabel')}</label>
                      <div className="relative">
                        {selectedCountry && (
                          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={flagUrl(selectedCountry.code)} alt={selectedCountry.code} className="w-6 h-4 rounded-sm object-cover ring-1 ring-border" />
                          </div>
                        )}
                        <select
                          value={filters.sellCountry}
                          onChange={e => handleCountryChange(e.target.value)}
                          className="select"
                          style={{ paddingLeft: selectedCountry ? '40px' : '12px' }}
                        >
                          <option value="">{t('offers.allCountries')}</option>
                          {sellCountries.map(c => (
                            <option key={c.code} value={c.code}>
                              {locale === 'fr' ? c.nameFr : c.name} ({c.currencyCode})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="field-label">{t('offers.sortLabel')}</label>
                      <div className="relative">
                        <select
                          value={filters.sort}
                          onChange={e => handleSortChange(e.target.value as SortOption)}
                          className="select"
                        >
                          {SORT_KEYS.map(key => (
                            <option key={key} value={key}>{sortLabels[key]}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="field-label">{t('offers.paymentLabel')}</label>
                      {paymentMethods.length === 0 ? (
                        <p className="text-sm italic text-muted-foreground/70">{t('offers.selectCountry')}</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {paymentMethods.map(pm => {
                            const facet = facets?.find(f => f.id === pm.id)
                            const count = facet?.count ?? 0
                            const checked = filters.paymentMethodIds.includes(pm.id)
                            return (
                              <label
                                key={pm.id}
                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                                  checked ? 'bg-primary-light border border-primary-bright/20' : 'hover:bg-muted border border-transparent'
                                }`}
                                style={{
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
                                  style={{ accentColor: 'var(--color-primary)' }}
                                />
                                {pm.isPopular && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
                                <span className={`flex-1 truncate font-medium ${checked ? 'text-primary-bright' : 'text-foreground'}`}>
                                  {pm.name}
                                </span>
                                <span className="text-xs text-muted-foreground/70 shrink-0">({count})</span>
                              </label>
                            )
                          })}
                          {filters.paymentMethodIds.length > 0 && (
                            <button
                              onClick={clearPaymentMethods}
                              className="text-left px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                            >
                              {t('offers.clearSelection')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="field-label">{t('offers.amountLabel')}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Min"
                          value={minDraft}
                          onChange={e => setMinDraft(e.target.value)}
                          className="input min-w-0 flex-1 w-0"
                        />
                          <span className="text-xs text-muted-foreground/50 shrink-0">—</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max"
                          value={maxDraft}
                          onChange={e => setMaxDraft(e.target.value)}
                          className="input min-w-0 flex-1 w-0"
                        />
                      </div>
                    </div>

                    {activeCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="w-full py-2.5 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
                      >
                        {t('offers.clearFilters', { count: activeCount })}
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 min-w-0">
                  {isLoading && isPending ? renderSkeletons() : devisesData?.items.length === 0 ? (
                    renderEmpty(tOffers('empty'))
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {devisesData?.items.map(offer => (
                          <OfferCard key={offer.id} offer={offer} isAuthenticated={isAuthenticated} locale={locale} />
                        ))}
                      </div>
                      {devisesData && renderPagination('page', filters.page, devisesData.totalPages)}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── TRAVEL KILO TAB ── */}
          {activeTab === 'kilos' && (
            <>
              <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="relative flex items-center flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={tkSearchDraft}
                    onChange={e => setTkSearchDraft(e.target.value)}
                    placeholder={t('travelKilo.searchPlaceholder')}
                    className="input !py-3 !rounded-xl pl-10"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filters.tkDeparture}
                    onChange={e => updateRouteFilter('tkFrom', e.target.value)}
                    className="select !py-3 !rounded-xl"
                  >
                    <option value="">{t('travelKilo.departureLabel')}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{locale === 'fr' ? c.nameFr : c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={filters.tkDestination}
                    onChange={e => updateRouteFilter('tkTo', e.target.value)}
                    className="select !py-3 !rounded-xl"
                  >
                    <option value="">{t('travelKilo.destinationLabel')}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{locale === 'fr' ? c.nameFr : c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0">
                  {t('travelKilo.resultCount', { count: tkData?.total ?? 0 })}
                </span>
              </div>

              {isLoading && isPending ? renderSkeletons() : tkData?.items.length === 0 ? (
                renderEmpty(t('travelKilo.empty'))
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {tkData?.items.map(offer => (
                      <TravelKiloCard key={offer.id} offer={offer} isAuthenticated={isAuthenticated} locale={locale} />
                    ))}
                  </div>
                  {tkData && renderPagination('tkpage', filters.tkPage, tkData.totalPages)}
                </>
              )}
            </>
          )}

          {/* ── BOAT SHIPPING TAB ── */}
          {activeTab === 'bateau' && (
            <>
              <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="relative flex items-center flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={bsSearchDraft}
                    onChange={e => setBsSearchDraft(e.target.value)}
                    placeholder={t('boatShipping.searchPlaceholder')}
                    className="input !py-3 !rounded-xl pl-10"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filters.bsDeparture}
                    onChange={e => updateRouteFilter('bsFrom', e.target.value)}
                    className="select !py-3 !rounded-xl"
                  >
                    <option value="">{t('boatShipping.departureLabel')}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{locale === 'fr' ? c.nameFr : c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={filters.bsDestination}
                    onChange={e => updateRouteFilter('bsTo', e.target.value)}
                    className="select !py-3 !rounded-xl"
                  >
                    <option value="">{t('boatShipping.destinationLabel')}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{locale === 'fr' ? c.nameFr : c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0">
                  {t('boatShipping.resultCount', { count: bsData?.total ?? 0 })}
                </span>
              </div>

              {isLoading && isPending ? renderSkeletons() : bsData?.items.length === 0 ? (
                renderEmpty(t('boatShipping.empty'))
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {bsData?.items.map(offer => (
                      <BoatShippingCard key={offer.id} offer={offer} isAuthenticated={isAuthenticated} locale={locale} />
                    ))}
                  </div>
                  {bsData && renderPagination('bspage', filters.bsPage, bsData.totalPages)}
                </>
              )}
            </>
          )}

        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section id="comment-ca-marche" className="relative py-20 lg:py-24 px-5 sm:px-6 overflow-hidden">
        <div className="aurora-orb top-0 right-0 w-[400px] h-[300px] bg-primary/10" />
        <div className="max-w-[1200px] mx-auto relative">
          <div className="text-center mb-14">
            <p className="eyebrow justify-center mb-3">{t('howItWorks.eyebrow')}</p>
            <h2 className="section-title">{t('howItWorks.title')}</h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="hidden lg:block absolute top-10 left-[22%] right-[22%] border-t-2 border-dashed border-border" />
            {([
              { key: 'step1' as const, icon: Search },
              { key: 'step2' as const, icon: UserPlus },
              { key: 'step3' as const, icon: Handshake },
            ]).map(({ key, icon: Icon }) => (
              <div key={key} className="relative card-interactive p-7">
                <div className="relative w-12 h-12 rounded-xl bg-primary-light border border-primary-bright/25 text-primary-bright flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-primary-bright mb-1.5">{t(`howItWorks.${key}.num`)}</p>
                <h3 className="text-lg font-bold mb-2 text-foreground">{t(`howItWorks.${key}.title`)}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{t(`howItWorks.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POURQUOI ══ */}
      <section className="relative bg-section border-y border-border/40 py-20 lg:py-24 px-5 sm:px-6 overflow-hidden">
        <div className="aurora-orb -top-20 left-1/4 w-[420px] h-[280px] bg-indigo-600/10" />
        <div className="max-w-[1200px] mx-auto relative">
          <div className="text-center mb-14">
            <p className="eyebrow justify-center mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('why.eyebrow')}
            </p>
            <h2 className="section-title">{t('why.title')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {([
              { key: 'p1' as const, icon: ShieldCheck },
              { key: 'p2' as const, icon: ArrowLeftRight },
              { key: 'p3' as const, icon: Star },
              { key: 'p4' as const, icon: Headset },
            ]).map(({ key, icon: Icon }) => (
              <div key={key} className="card-interactive p-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-bright to-primary-deeper text-primary-foreground flex items-center justify-center shadow-glow-teal mb-4">
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">{t(`why.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(`why.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="relative overflow-hidden py-20 lg:py-24 px-5 sm:px-6">
        <div className="absolute inset-x-5 sm:inset-x-6 inset-y-6 max-w-[1160px] mx-auto rounded-[28px] bg-gradient-to-br from-primary-deeper via-[#0b3b36] to-[#071018] border border-primary-bright/20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light mask-fade-radial" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[260px] bg-secondary/25 blur-[110px] rounded-full" />

          <div className="relative max-w-[620px] mx-auto text-center py-16 lg:py-20 px-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-[-0.015em]">{t('cta.title')}</h2>
            <p className="text-base lg:text-lg text-teal-100/80 mb-9">{t('cta.subtitle')}</p>
            <Link href={`/${locale}/auth/inscription`} className="btn-white">
              {t('cta.button')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
