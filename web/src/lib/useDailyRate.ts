'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'
import type { ExchangeRatePair, OfferRateMode } from '@/types/api'

const REFRESH_MS = 5 * 60 * 1000

export function useExchangeRates(from: string | undefined, to: string | undefined) {
  const key = from && to ? `/api/exchange-rates?from=${from}&to=${to}` : null
  const { data, error, isLoading } = useSWR<ExchangeRatePair>(
    key,
    (url: string) => api.get<ExchangeRatePair>(url),
    { refreshInterval: REFRESH_MS, revalidateOnFocus: false }
  )
  return { rates: data, isLoading, error }
}

export function useDisplayRate(
  rateMode: OfferRateMode,
  fixedRate: number | null,
  sellCurrency: string,
  buyCurrency: string
): { value: number | null; sourceLabel: 'Fixed' | 'Google' | 'XE'; isLoading: boolean } {
  const needsFetch = rateMode !== 'Fixed'
  const { rates, isLoading } = useExchangeRates(
    needsFetch ? buyCurrency : undefined,
    needsFetch ? sellCurrency : undefined
  )

  if (rateMode === 'Fixed') {
    return { value: fixedRate, sourceLabel: 'Fixed', isLoading: false }
  }
  if (rateMode === 'GoogleDaily') {
    return { value: rates?.google ?? null, sourceLabel: 'Google', isLoading }
  }
  return { value: rates?.xe ?? null, sourceLabel: 'XE', isLoading }
}
