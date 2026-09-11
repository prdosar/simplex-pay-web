'use client'

import useSWRImmutable from 'swr/immutable'
import { api } from '@/lib/api'
import type { CountryDto } from '@/types/api'

/** Charge /api/countries UNE FOIS par session (SWR immutable = pas de revalidation focus/reconnect/interval).
 *  Le backend renvoie Cache-Control: public, max-age=86400 → 2e chargement dans les 24h = 0 request réseau
 *  (servi depuis le cache navigateur). Idem pour les payment methods embarqués dans chaque CountryDto. */
export function useCountries() {
  return useSWRImmutable<CountryDto[]>('/api/countries', (url: string) => api.get<CountryDto[]>(url))
}
