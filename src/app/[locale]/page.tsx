import HomeClient, { type HomeData } from './HomeClient'
import {
  getOfferPaymentMethodFacets,
  searchBoatShipping,
  searchOffers,
  searchTravelKilo,
  getCountries,
  type OfferSort,
} from '@/lib/queries'

export const PAGE_SIZE = 12

const TABS = ['devises', 'kilos', 'bateau'] as const
const SORTS: OfferSort[] = ['recent', 'rate_desc', 'rate_asc', 'amount_desc']

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return v && v.length > 0 ? v : undefined
}

function toInt(value: string | string[] | undefined): number {
  const n = parseInt(first(value) ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : NaN
}

function toNum(value: string | string[] | undefined): number | undefined {
  const v = first(value)
  if (v == null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])

  const countries = await getCountries()

  // ── Devises params ──
  const tabRaw = first(sp.tab)
  const tab = (TABS as readonly string[]).includes(tabRaw ?? '') ? (tabRaw as HomeData['kind']) : 'devises'

  const sellCountries = countries.filter(c => c.currencyType === 'Sell')
  const countryParam = first(sp.country)
  const sellCountry =
    countryParam && sellCountries.some(c => c.code === countryParam) ? countryParam : ''

  const paymentMethodIds =
    sp.pm != null
      ? (Array.isArray(sp.pm) ? sp.pm : [sp.pm]).filter(p => p.length > 0)
      : []
  const search = first(sp.q) ?? ''
  const minAmount = toNum(sp.min)
  const maxAmount = toNum(sp.max)
  const sortParam = first(sp.sort) as OfferSort | undefined
  const sort = sortParam && SORTS.includes(sortParam) ? sortParam : 'recent'
  const page = Math.max(1, toInt(sp.page) || 1)

  // ── Kilos / bateau params ──
  const tkDeparture = first(sp.tkFrom)
  const tkDestination = first(sp.tkTo)
  const tkSearch = first(sp.tq) ?? ''
  const tkPage = Math.max(1, toInt(sp.tkpage) || 1)
  const bsDeparture = first(sp.bsFrom)
  const bsDestination = first(sp.bsTo)
  const bsSearch = first(sp.bq) ?? ''
  const bsPage = Math.max(1, toInt(sp.bspage) || 1)

  let data: HomeData = { kind: 'devises', offers: { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 }, facets: [] }

  if (tab === 'devises') {
    const filters = {
      sellCountryCode: sellCountry || undefined,
      paymentMethodIds,
      search,
      minAmount,
      maxAmount,
    }
    const [offers, facets] = await Promise.all([
      searchOffers(filters, sort, page, PAGE_SIZE),
      getOfferPaymentMethodFacets({
        sellCountryCode: sellCountry || undefined,
        search,
        minAmount,
        maxAmount,
      }),
    ])
    data = { kind: 'devises', offers, facets }
  } else if (tab === 'kilos') {
    data = {
      kind: 'kilos',
      offers: await searchTravelKilo(
        {
          departureCountryCode: tkDeparture,
          destinationCountryCode: tkDestination,
          search: tkSearch,
        },
        tkPage,
        PAGE_SIZE,
      ),
    }
  } else {
    data = {
      kind: 'bateau',
      offers: await searchBoatShipping(
        {
          departureCountryCode: bsDeparture,
          destinationCountryCode: bsDestination,
          search: bsSearch,
        },
        bsPage,
        PAGE_SIZE,
      ),
    }
  }

  return (
    <HomeClient
      locale={locale}
      countries={countries}
      activeTab={tab}
      filters={{
        sellCountry,
        paymentMethodIds,
        search,
        minAmount: first(sp.min),
        maxAmount: first(sp.max),
        sort,
        page,
        tkDeparture: tkDeparture ?? '',
        tkDestination: tkDestination ?? '',
        tkSearch,
        tkPage,
        bsDeparture: bsDeparture ?? '',
        bsDestination: bsDestination ?? '',
        bsSearch,
        bsPage,
      }}
      data={data}
    />
  )
}
