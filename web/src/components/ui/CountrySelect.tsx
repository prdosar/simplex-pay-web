'use client'

import { useEffect, useRef, useState } from 'react'
import { flagUrl } from '@/lib/utils'
import type { CountryDto } from '@/types/api'

interface Props {
  value: string
  onChange: (code: string) => void
  countries: CountryDto[]
  locale: string
  allowEmpty?: boolean
  emptyLabel?: string
  placeholder?: string
  // Affiche le code devise après le nom (utile pour l'onglet Devises).
  showCurrencyCode?: boolean
}

/** Combobox pays avec drapeaux — remplace le <select> natif qui ne peut pas rendre d'<img>. */
export default function CountrySelect({
  value, onChange, countries, locale,
  allowEmpty = true, emptyLabel, placeholder, showCurrencyCode = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = countries.find(c => c.code === value)
  const fallbackEmpty = emptyLabel ?? (locale === 'fr' ? 'Tous les pays' : 'All countries')

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = (c: CountryDto) =>
    (locale === 'fr' ? c.nameFr : c.name) + (showCurrencyCode ? ` (${c.currencyCode})` : '')

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full border border-[#e2e8f0] rounded-lg py-2.5 pl-3 pr-9 text-sm bg-white text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
      >
        {selected ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagUrl(selected.code)} alt={selected.code} className="w-6 h-4 rounded-sm object-cover shrink-0" />
            <span className="truncate" style={{ color: '#0f172a' }}>{label(selected)}</span>
          </>
        ) : (
          <span style={{ color: '#94a3b8' }} className="truncate">{placeholder ?? fallbackEmpty}</span>
        )}
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
             style={{ color: '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 mt-1 max-h-64 overflow-auto rounded-lg border bg-white shadow-lg z-30 py-1"
          style={{ borderColor: '#e2e8f0' }}
        >
          {allowEmpty && (
            <li
              role="option"
              aria-selected={value === ''}
              onClick={() => { onChange(''); setOpen(false) }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-[#f1f5f9] italic"
              style={value === '' ? { background: '#ccfbf1', color: '#0f766e' } : { color: '#64748b' }}
            >
              {fallbackEmpty}
            </li>
          )}
          {countries.map(c => (
            <li
              key={c.code}
              role="option"
              aria-selected={c.code === value}
              onClick={() => { onChange(c.code); setOpen(false) }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-[#f1f5f9] flex items-center gap-2"
              style={c.code === value
                ? { background: '#ccfbf1', color: '#0f766e', fontWeight: 600 }
                : { color: '#0f172a' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl(c.code)} alt={c.code} className="w-6 h-4 rounded-sm object-cover shrink-0" />
              <span className="truncate">{label(c)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
