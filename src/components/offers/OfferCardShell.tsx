'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  href?: string
  route: ReactNode
  metricLabel: string
  metricValue: ReactNode
  meta: { label: string; value: ReactNode }[]
  chips?: ReactNode
  notes?: string | null
  creatorName: string
  creatorRating: number
  footerRight: ReactNode
}

export default function OfferCardShell({
  href,
  route,
  metricLabel,
  metricValue,
  meta,
  chips,
  notes,
  creatorName,
  creatorRating,
  footerRight,
}: Props) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 font-bold text-[15px] min-w-0 text-foreground">{route}</div>
        <span className="badge-active shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          Active
        </span>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-1">{metricLabel}</p>
      <p className="text-[26px] font-extrabold text-primary leading-tight mb-4 tracking-tight">{metricValue}</p>

      <div className="grid grid-cols-2 gap-2 bg-muted border border-border/60 rounded-xl px-3.5 py-3 mb-4">
        {meta.map(m => (
          <div key={m.label} className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground mb-0.5 truncate">{m.label}</p>
            <p className="text-[13px] font-bold text-foreground truncate">{m.value}</p>
          </div>
        ))}
      </div>

      {chips}

      {notes && (
        <p className="text-[12.5px] leading-relaxed text-muted-foreground line-clamp-2 mb-4">{notes}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-3.5 border-t border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-primary to-primary-deeper text-primary-foreground flex items-center justify-center text-[11px] font-extrabold shrink-0">
            {creatorName[0]}
          </span>
          <span className="text-[13px] font-bold text-foreground truncate">{creatorName}</span>
          {creatorRating > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {creatorRating.toFixed(1)}
            </span>
          )}
        </div>
        {footerRight}
      </div>
    </>
  )

  const className = 'card-interactive group block p-5 h-full'

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    )
  }
  return <div className={className}>{body}</div>
}
