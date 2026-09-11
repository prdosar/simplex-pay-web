// UI-facing offer status : 3 valeurs collapsées depuis les 5 du domaine backend.
// - Active  ↔ Open
// - Partiel ↔ PartiallyFilled
// - Clôturé ↔ Filled | Cancelled | Expired (mappé sur Cancelled à la sauvegarde)

export type UiStatus = 'active' | 'partial' | 'closed'
export const UI_STATUSES: UiStatus[] = ['active', 'partial', 'closed']

export function backendToUi(s: string): UiStatus {
  if (s === 'Open') return 'active'
  if (s === 'PartiallyFilled') return 'partial'
  return 'closed'
}

export function uiToBackend(s: UiStatus): string {
  if (s === 'active') return 'Open'
  if (s === 'partial') return 'PartiallyFilled'
  return 'Cancelled'
}

export function uiStatusLabel(s: UiStatus, locale: string): string {
  if (s === 'active')  return locale === 'fr' ? 'Active'  : 'Active'
  if (s === 'partial') return locale === 'fr' ? 'Partiel' : 'Partial'
  return locale === 'fr' ? 'Clôturé' : 'Closed'
}
