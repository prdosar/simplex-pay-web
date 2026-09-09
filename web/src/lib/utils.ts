import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(amount: number, symbol: string, decimalPlaces = 0): string {
  return `${symbol} ${amount.toLocaleString('fr', { maximumFractionDigits: decimalPlaces })}`
}

export function formatDate(dateStr: string, locale = 'fr'): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function flagUrl(countryCode: string): string {
  return `/flags/${countryCode.toLowerCase()}.png`
}
