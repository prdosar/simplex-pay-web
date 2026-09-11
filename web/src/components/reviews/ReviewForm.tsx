'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { ReviewDto } from '@/types/api'

interface Props {
  targetUserId: string
  targetName: string
  locale: string
  // Avis existant du user connecté (pour édition). Récupéré par le parent via /api/users/{id}/reviews.
  existing?: ReviewDto
  // Callback appelé après un save réussi (le parent revalide sa liste d'avis).
  onSaved?: () => void
  // Titre custom (par défaut : "Laisser un avis" / "Modifier votre avis").
  title?: string
}

/** Formulaire d'avis 5 étoiles + commentaire. Gère aussi les états non-connecté / email non vérifié / soi-même
 *  en affichant un message contextuel à la place du formulaire. */
export default function ReviewForm({ targetUserId, targetName, locale, existing, onSaved, title }: Props) {
  const t = useTranslations('profile')
  const { user: me, isAuthenticated } = useAuth()

  const [rating, setRating] = useState<number>(existing?.rating ?? 0)
  const [hover, setHover] = useState<number>(0)
  const [comment, setComment] = useState<string>(existing?.comment ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isSelf = me?.id === targetUserId
  const displayed = hover || rating

  // Cas où on n'affiche pas le formulaire.
  if (!isAuthenticated) {
    return (
      <div className="bg-white border rounded-2xl p-4 text-sm text-center" style={{ borderColor: '#e2e8f0', color: '#64748b' }}>
        <Link href={`/${locale}/auth/connexion`} className="font-semibold hover:underline" style={{ color: '#0d9488' }}>
          {t('loginToReview')}
        </Link>
      </div>
    )
  }
  if (isSelf) return null
  if (!me?.emailVerified) {
    return (
      <div className="border rounded-xl p-4 text-sm" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
        {t('verifyToReview')}
      </div>
    )
  }

  async function submit() {
    setError(null)
    setSuccess(false)
    if (rating < 1 || rating > 5) {
      setError(t('errorRating'))
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/api/users/${targetUserId}/reviews`, {
        rating,
        comment: comment.trim() || null,
      })
      setSuccess(true)
      onSaved?.()
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { message?: string } | undefined
        setError(body?.message ?? `${err.status}`)
      } else {
        setError(t('errorGeneric'))
      }
    } finally {
      setSubmitting(false)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="bg-white border rounded-2xl p-6" style={{ borderColor: '#e2e8f0' }}>
      <h2 className="text-base font-bold mb-1" style={{ color: '#0f172a' }}>
        {title ?? (existing ? t('editReviewFor', { name: targetName }) : t('newReviewFor', { name: targetName }))}
      </h2>
      <p className="text-xs mb-4" style={{ color: '#64748b' }}>{t('formHelp')}</p>

      <div className="flex items-center gap-1.5 mb-4" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className="text-2xl leading-none transition-transform hover:scale-110"
            style={{ color: n <= displayed ? '#f59e0b' : '#e2e8f0' }}
            aria-label={t('ratingLabel', { n })}
          >
            {n <= displayed ? '★' : '☆'}
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-semibold" style={{ color: '#64748b' }}>{rating}/5</span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder={t('commentPlaceholder')}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] resize-none"
        style={{ borderColor: '#e2e8f0' }}
      />
      <div className="text-xs mt-1 text-right" style={{ color: '#94a3b8' }}>{comment.length}/1000</div>

      {error && <p className="text-sm mt-2" style={{ color: '#ef4444' }}>{error}</p>}
      {success && <p className="text-sm mt-2" style={{ color: '#0d9488' }}>{t('savedOk')}</p>}

      <button
        onClick={submit}
        disabled={submitting || rating < 1}
        className="mt-3 w-full py-2.5 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: '#0d9488' }}
      >
        {submitting ? t('submitting') : existing ? t('updateBtn') : t('submitBtn')}
      </button>
    </div>
  )
}
