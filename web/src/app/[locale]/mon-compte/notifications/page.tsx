'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import useSWR, { mutate } from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { PagedNotifications, NotificationDto } from '@/types/api'

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth()
  const locale = useLocale()
  const [page, setPage] = useState(1)

  const key = `/api/notifications?page=${page}&pageSize=${PAGE_SIZE}`
  const { data, isLoading } = useSWR<PagedNotifications>(
    isAuthenticated ? key : null,
    (url: string) => api.get<PagedNotifications>(url)
  )

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-[#64748b]">{locale === 'fr' ? 'Connectez-vous pour voir vos notifications.' : 'Log in to view your notifications.'}</p>
        <Link href={`/${locale}/auth/connexion`} className="mt-4 inline-block px-6 py-2.5 text-white rounded-lg" style={{ background: '#0d9488' }}>
          {locale === 'fr' ? 'Se connecter' : 'Log in'}
        </Link>
      </div>
    )
  }

  async function markRead(id: string) {
    await api.patch(`/api/notifications/${id}/read`)
    mutate(key)
    mutate('/api/notifications/unread-count')
  }

  async function markAllRead() {
    await api.patch('/api/notifications/read-all')
    mutate(key)
    mutate('/api/notifications/unread-count')
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/${locale}/mon-compte`} className="text-sm hover:underline mb-4 inline-block" style={{ color: '#64748b' }}>
        ← {locale === 'fr' ? 'Mon compte' : 'My account'}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">{locale === 'fr' ? 'Notifications' : 'Notifications'}</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            {data ? `${data.total} au total — ${data.unreadCount} non-lue(s)` : '…'}
          </p>
        </div>
        {(data?.unreadCount ?? 0) > 0 && (
          <button onClick={markAllRead} className="text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: '#0d9488' }}>
            {locale === 'fr' ? 'Tout marquer lu' : 'Mark all read'}
          </button>
        )}
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden divide-y" style={{ borderColor: '#e2e8f0' }}>
        {isLoading && <div className="p-6 text-sm text-center text-[#64748b]">…</div>}
        {!isLoading && data?.items.length === 0 && (
          <div className="p-10 text-sm text-center text-[#94a3b8]">
            {locale === 'fr' ? 'Aucune notification.' : 'No notifications.'}
          </div>
        )}
        {data?.items.map(n => <Row key={n.id} n={n} locale={locale} onMarkRead={() => markRead(n.id)} />)}
      </div>

      {data && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm rounded border disabled:opacity-40" style={{ borderColor: '#e2e8f0' }}>
            ←
          </button>
          <span className="px-3 py-1.5 text-sm" style={{ color: '#64748b' }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm rounded border disabled:opacity-40" style={{ borderColor: '#e2e8f0' }}>
            →
          </button>
        </div>
      )}
    </div>
  )
}

function Row({ n, locale, onMarkRead }: { n: NotificationDto; locale: string; onMarkRead: () => void }) {
  const date = new Date(n.createdAt).toLocaleString(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const content = (
    <div className={`p-4 flex gap-3 items-start ${n.isRead ? '' : 'bg-teal-50/40'} hover:bg-slate-50`}>
      <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: n.isRead ? 'transparent' : '#0d9488' }} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${n.isRead ? 'text-[#475569]' : 'text-slate-900 font-semibold'}`}>{n.title}</p>
        {n.body && <p className="text-sm text-[#64748b] mt-1">{n.body}</p>}
        <p className="text-xs text-[#94a3b8] mt-2">{date}</p>
      </div>
      {!n.isRead && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMarkRead() }}
                className="text-xs text-[#0d9488] hover:underline shrink-0">
          {locale === 'fr' ? 'Marquer lu' : 'Mark read'}
        </button>
      )}
    </div>
  )

  if (n.link) {
    return <Link href={`/${locale}${n.link}`} onClick={onMarkRead} className="block">{content}</Link>
  }
  return <div>{content}</div>
}
