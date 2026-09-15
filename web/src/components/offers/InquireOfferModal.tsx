'use client'

import { useState } from 'react'
import { api, ApiError } from '@/lib/api'

interface Props {
  offerId: string
  offerLabel: string   // ex: "XOF → CAD"
  creatorFirstName: string
  locale: string
  onClose: () => void
}

export default function InquireOfferModal({ offerId, offerLabel, creatorFirstName, locale, onClose }: Props) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await api.post(`/api/offers/${offerId}/inquire`, { message: message.trim() || null })
      setDone(true)
    } catch (e) {
      const msg = e instanceof ApiError
        ? ((e.body as { message?: string })?.message ?? e.message)
        : (e instanceof Error ? e.message : 'Erreur')
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="text-base font-semibold" style={{ color: '#0f172a' }}>
            {locale === 'fr' ? `Contacter ${creatorFirstName}` : `Contact ${creatorFirstName}`}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
              {locale === 'fr' ? 'Message envoyé' : 'Message sent'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>
              {locale === 'fr'
                ? `${creatorFirstName} sera notifié·e par email et dans son compte.`
                : `${creatorFirstName} will be notified by email and in-app.`}
            </p>
            <button onClick={onClose}
              className="mt-6 px-6 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ background: '#0d9488' }}>
              {locale === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <p className="text-sm" style={{ color: '#334155' }}>
              {locale === 'fr'
                ? `Demandez à ${creatorFirstName} si son offre ${offerLabel} est encore disponible. Iel recevra un email et une notification.`
                : `Ask ${creatorFirstName} if their ${offerLabel} offer is still available. They will get an email and an in-app notification.`}
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#64748b' }}>
                {locale === 'fr' ? 'Message (optionnel)' : 'Message (optional)'}
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder={locale === 'fr' ? 'Ex : Je suis intéressé par un montant de 100 000 XOF. Est-ce toujours disponible ?' : 'Ex: I\'m interested in 100,000 XOF. Is it still available?'}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                style={{ borderColor: '#e2e8f0' }}
              />
              <p className="text-[10px] mt-1 text-right" style={{ color: '#94a3b8' }}>{message.length}/500</p>
            </div>

            {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={onClose} disabled={busy}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg border" style={{ borderColor: '#e2e8f0', color: '#64748b' }}>
                {locale === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button type="submit" disabled={busy}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                style={{ background: '#0d9488' }}>
                {busy ? (locale === 'fr' ? 'Envoi…' : 'Sending…') : (locale === 'fr' ? 'Envoyer' : 'Send')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
