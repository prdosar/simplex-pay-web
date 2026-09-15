'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Bell } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { PagedNotifications, NotificationDto } from '@/types/api'

const POLL_MS = 30_000

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  // Compteur non-lues (léger — appelé toutes les 30s, revalidé au focus).
  const { data: unread } = useSWR<{ count: number }>(
    isAuthenticated ? '/api/notifications/unread-count' : null,
    (url: string) => api.get<{ count: number }>(url),
    { refreshInterval: POLL_MS, revalidateOnFocus: true }
  )

  // Liste chargée seulement à l'ouverture du dropdown pour éviter la charge inutile.
  const listUrl = isAuthenticated && open ? '/api/notifications?page=1&pageSize=10' : null
  const { data: list, isLoading } = useSWR<PagedNotifications>(
    listUrl,
    (url: string) => api.get<PagedNotifications>(url)
  )

  const unreadCount = unread?.count ?? 0

  // Fermer au clic dehors ou Escape.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!isAuthenticated) return null

  async function markRead(id: string) {
    await api.patch(`/api/notifications/${id}/read`)
    mutate('/api/notifications/unread-count')
    mutate('/api/notifications?page=1&pageSize=10')
  }

  async function markAllRead() {
    if (unreadCount === 0) return
    await api.patch('/api/notifications/read-all')
    mutate('/api/notifications/unread-count')
    mutate('/api/notifications?page=1&pageSize=10')
  }

  return (
    <div ref={anchorRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={locale === 'fr' ? 'Notifications' : 'Notifications'}
        className="relative p-2 rounded-full text-[#334155] hover:bg-slate-100 hover:text-[--color-primary] transition-colors"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none"
                style={{ background: '#dc2626', color: 'white' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden bg-white rounded-xl shadow-xl border border-[--color-border] flex flex-col z-50">
          <div className="px-4 py-3 border-b border-[--color-border] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{locale === 'fr' ? 'Notifications' : 'Notifications'}</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-[--color-primary] hover:underline">
                {locale === 'fr' ? 'Tout marquer lu' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[--color-border]">
            {isLoading && <div className="p-6 text-sm text-center text-[--color-muted-foreground]">…</div>}
            {!isLoading && list && list.items.length === 0 && (
              <div className="p-8 text-sm text-center text-[--color-muted-foreground]">
                {locale === 'fr' ? 'Aucune notification.' : 'No notifications.'}
              </div>
            )}
            {list?.items.map(n => (
              <NotificationRow key={n.id} n={n} locale={locale} onClick={() => { markRead(n.id); setOpen(false) }} />
            ))}
          </div>

          {list && list.total > 10 && (
            <Link
              href={`/${locale}/mon-compte/notifications`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-xs font-medium text-[--color-primary] hover:bg-slate-50 border-t border-[--color-border]"
            >
              {locale === 'fr' ? 'Voir tout' : 'View all'} ({list.total})
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function NotificationRow({ n, locale, onClick }: { n: NotificationDto; locale: string; onClick: () => void }) {
  const timeAgo = useMemo(() => formatTimeAgo(n.createdAt, locale), [n.createdAt, locale])

  const inner = (
    <div className={`px-4 py-3 flex gap-3 items-start transition-colors ${n.isRead ? '' : 'bg-teal-50/50'} hover:bg-slate-50`}>
      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.isRead ? 'transparent' : '#0d9488' }} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${n.isRead ? 'text-[#475569]' : 'text-slate-900 font-medium'}`}>
          {n.title}
        </p>
        {n.body && <p className="text-xs text-[--color-muted-foreground] mt-0.5 line-clamp-2">{n.body}</p>}
        <p className="text-[10px] text-[--color-muted-foreground] mt-1 uppercase tracking-wide">{timeAgo}</p>
      </div>
    </div>
  )

  if (n.link) {
    return (
      <Link href={`/${locale}${n.link}`} onClick={onClick} className="block">
        {inner}
      </Link>
    )
  }
  return <button onClick={onClick} className="block w-full text-left">{inner}</button>
}

function formatTimeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return locale === 'fr' ? 'À l’instant' : 'Just now'
  if (m < 60) return locale === 'fr' ? `il y a ${m} min` : `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return locale === 'fr' ? `il y a ${h} h` : `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return locale === 'fr' ? `il y a ${d} j` : `${d}d ago`
  return new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-CA' : 'en-CA')
}
