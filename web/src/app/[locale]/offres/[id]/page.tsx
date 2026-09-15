'use client'

import { use, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { api } from '@/lib/api'
import { flagUrl } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import ReviewForm from '@/components/reviews/ReviewForm'
import InquireOfferModal from '@/components/offers/InquireOfferModal'
import type { OfferDto, PagedResult, ReviewDto } from '@/types/api'

export default function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('offer')
  const locale = useLocale()
  const { isAuthenticated, user: me } = useAuth()
  const [showInquire, setShowInquire] = useState(false)

  const { data: offer, isLoading, error } = useSWR<OfferDto>(
    `/api/offers/${id}`,
    (url: string) => api.get<OfferDto>(url)
  )

  const creatorId = offer?.creator.id
  const { data: reviews, mutate: mutateReviews } = useSWR<PagedResult<ReviewDto>>(
    creatorId ? `/api/users/${creatorId}/reviews?page=1&pageSize=3` : null,
    (url: string) => api.get<PagedResult<ReviewDto>>(url)
  )
  const myExistingReview = me && offer ? reviews?.items.find(r => r.reviewerId === me.id) : undefined

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-48" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  )

  if (error || !offer) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-[--color-destructive]">Offre introuvable.</p>
      <Link href={`/${locale}/offres`} className="text-[--color-primary] mt-4 inline-block hover:underline">
        ← {t('back')}
      </Link>
    </div>
  )

  const fromMethods = offer.paymentMethods.filter(pm => pm.side === 'From')
  const toMethods = offer.paymentMethods.filter(pm => pm.side === 'To')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href={`/${locale}/offres`} className="text-sm text-[--color-muted-foreground] hover:text-[--color-primary] flex items-center gap-1 mb-6">
        ← {t('back')}
      </Link>

      <div className="bg-white border border-[--color-border] rounded-2xl overflow-hidden">
        {/* Header. Multi-pays vendeurs (UEMOA/CEMAC) : liste de drapeaux + codes. */}
        <div className="bg-gradient-to-br from-[--color-primary] to-[--color-primary-dark] p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center -space-x-2 shrink-0">
              {offer.sellCountries.slice(0, 4).map(code => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={code} src={flagUrl(code)} alt={code}
                  className="w-14 h-10 rounded object-cover shadow ring-2 ring-white/40" />
              ))}
            </span>
            <div>
              <p className="text-3xl font-bold">{offer.sellCurrency} → {offer.buyCurrency}</p>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5 flex-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl(offer.buyCountry)} alt={offer.buyCountry} className="w-5 h-3.5 rounded-sm object-cover" />
                {offer.buyCountry}
                <span>↔</span>
                {offer.sellCountries.map(code => (
                  <span key={code} className="inline-flex items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl(code)} alt={code} className="w-5 h-3.5 rounded-sm object-cover" />
                    {code}
                  </span>
                ))}
              </p>
            </div>
          </div>
          {/* Taux : afficher l'offre TELLE QUE saisie. Pas de conversion pour Google/XE. */}
          {offer.rateMode === 'Fixed' ? (
            <div className="text-4xl font-bold mt-4">
              {offer.rate !== null
                ? offer.rate.toLocaleString(locale, { maximumFractionDigits: 2 })
                : '—'}
              <span className="text-xl font-normal text-white/80 ml-2">
                {offer.sellCurrencySymbol}/{offer.buyCurrencySymbol}
              </span>
            </div>
          ) : (
            <div className="text-2xl font-bold mt-4 text-white/95">
              {offer.rateMode === 'GoogleDaily'
                ? (locale === 'fr' ? 'Taux Google du jour' : 'Google daily rate')
                : (locale === 'fr' ? 'Taux XE du jour' : 'XE daily rate')}
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[--color-border]">
            <div>
              <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-1">Disponible</p>
              <p className="text-xl font-bold">{offer.remainingAmount.toLocaleString()} <span className="text-sm text-[--color-muted-foreground]">{offer.sellCurrencySymbol}</span></p>
            </div>
            <div>
              <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-1">Min</p>
              <p className="text-xl font-bold">{offer.minAmount.toLocaleString()} <span className="text-sm text-[--color-muted-foreground]">{offer.sellCurrencySymbol}</span></p>
            </div>
          </div>

          {/* Équivalent — uniquement quand le vendeur a fixé un taux explicite (Fixed).
              Pour Google/XE, aucune conversion : le taux fluctue et n'engage pas le vendeur. */}
          {offer.rateMode === 'Fixed' && offer.rate !== null && offer.rate > 0 && (
            <div className="bg-[--color-muted] rounded-xl p-4 mb-6">
              <p className="text-sm text-[--color-muted-foreground]">
                {t('buyEquivalent', { currency: offer.buyCurrency })}
              </p>
              <p className="text-2xl font-bold text-[--color-primary]">
                {offer.buyCurrencySymbol} {(offer.amount / offer.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Payment methods */}
          {(fromMethods.length > 0 || toMethods.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[--color-border]">
              {fromMethods.length > 0 && (
                <div>
                  <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-2">{t('paymentFrom')}</p>
                  <div className="flex flex-wrap gap-2">
                    {fromMethods.map((pm, i) => (
                      <span key={i} className="text-sm px-3 py-1 bg-[--color-primary-light] text-[--color-primary] rounded-full font-medium">
                        {pm.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {toMethods.length > 0 && (
                <div>
                  <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-2">{t('paymentTo')}</p>
                  <div className="flex flex-wrap gap-2">
                    {toMethods.map((pm, i) => (
                      <span key={i} className="text-sm px-3 py-1 bg-[--color-muted] text-[--color-foreground] rounded-full">
                        {pm.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {offer.notes && (
            <div className="mb-6 pb-6 border-b border-[--color-border]">
              <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-2">{t('notes')}</p>
              <p className="text-sm bg-[--color-muted] rounded-lg p-3">{offer.notes}</p>
            </div>
          )}

          {/* Seller + contact */}
          <div>
            <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-3">{t('creator')}</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[--color-primary] text-white text-lg flex items-center justify-center font-bold shrink-0">
                {offer.creator.firstName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/${locale}/profil/${offer.creator.id}`}
                    className="font-semibold hover:underline"
                    style={{ color: '#0f172a' }}
                  >
                    {offer.creator.firstName} {offer.creator.lastName ?? ''}
                  </Link>
                  {offer.creator.isCertified && (
                    <span
                      title={locale === 'fr' ? 'Utilisateur certifié' : 'Certified user'}
                      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-[3px] rounded-full"
                      style={{ background: '#ccfbf1', color: '#0f766e' }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M12 2l2.6 2.3 3.5-.5.5 3.5L21 10l-2.4 2.6.5 3.5-3.5.5L13 21l-2.6-2.4-3.5.5-.5-3.5L4 13l2.4-2.6-.5-3.5 3.5-.5L12 2zm-1.2 12.6l6.4-6.4-1.4-1.4-5 5-2.4-2.4-1.4 1.4 3.8 3.8z" />
                      </svg>
                      {locale === 'fr' ? 'Certifié' : 'Certified'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[--color-muted-foreground] flex items-center gap-1.5 flex-wrap">
                  {offer.creator.reviewCount > 0 ? (
                    <>
                      <span style={{ color: '#f59e0b' }}>★ {offer.creator.rating.toFixed(1)}</span>
                      <span>({offer.creator.reviewCount} {locale === 'fr' ? 'avis' : 'reviews'})</span>
                    </>
                  ) : (
                    <span className="italic">{locale === 'fr' ? 'Aucun avis' : 'No reviews yet'}</span>
                  )}
                </p>
                <Link
                  href={`/${locale}/profil/${offer.creator.id}`}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold hover:underline"
                  style={{ color: '#0d9488' }}
                >
                  {locale === 'fr' ? 'Voir le profil et laisser un avis →' : 'View profile and leave a review →'}
                </Link>
              </div>
            </div>

            {/* Contact info */}
            {isAuthenticated ? (
              <div className="bg-[--color-muted] rounded-xl p-4 space-y-2">
                <p className="text-xs text-[--color-muted-foreground] uppercase tracking-wide mb-3">{t('contactInfo')}</p>
                {offer.creator.phone && (
                  <a href={`tel:${offer.creator.phone}`} className="flex items-center gap-2 text-[--color-foreground] hover:text-[--color-primary] font-medium">
                    📞 {offer.creator.phone}
                  </a>
                )}
                {offer.creator.whatsApp && (
                  <a href={`https://wa.me/${offer.creator.whatsApp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[--color-success] hover:underline font-medium">
                    💬 WhatsApp: {offer.creator.whatsApp}
                  </a>
                )}
                {/* Inquiry — pas visible sur ses propres offres */}
                {me?.id !== offer.creator.id && (
                  <button
                    onClick={() => setShowInquire(true)}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg border transition-colors hover:bg-white"
                    style={{ borderColor: '#0d9488', color: '#0d9488' }}
                  >
                    ✉️ {locale === 'fr' ? "Demander si l'offre est encore disponible" : 'Ask if this offer is still available'}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[--color-muted] rounded-xl p-5 text-center">
                <p className="text-[--color-muted-foreground] mb-4">🔒 {t('loginRequired')}</p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href={`/${locale}/auth/inscription`}
                    className="px-5 py-2.5 bg-[--color-primary] text-white font-semibold rounded-lg hover:bg-[--color-primary-dark] transition-colors"
                  >
                    {locale === 'fr' ? "S'inscrire" : 'Sign up'}
                  </Link>
                  <Link
                    href={`/${locale}/auth/connexion`}
                    className="px-5 py-2.5 border border-[--color-border] text-[--color-foreground] rounded-lg hover:border-[--color-primary] transition-colors"
                  >
                    {locale === 'fr' ? 'Se connecter' : 'Log in'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews about the seller (toujours visible, 3 derniers + lien profil) */}
      <div className="mt-6 bg-white border rounded-2xl p-6" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>
            {locale === 'fr' ? `Avis sur ${offer.creator.firstName}` : `Reviews about ${offer.creator.firstName}`}
          </h2>
          <div className="flex items-center gap-3 text-sm">
            {offer.creator.reviewCount > 0 ? (
              <span className="flex items-center gap-1" style={{ color: '#0f172a' }}>
                <span className="text-base" style={{ color: '#f59e0b' }}>★</span>
                <span className="font-bold">{offer.creator.rating.toFixed(1)}</span>
                <span style={{ color: '#64748b' }}>· {offer.creator.reviewCount} {locale === 'fr' ? (offer.creator.reviewCount > 1 ? 'avis' : 'avis') : (offer.creator.reviewCount > 1 ? 'reviews' : 'review')}</span>
              </span>
            ) : (
              <span className="italic" style={{ color: '#94a3b8' }}>
                {locale === 'fr' ? 'Aucun avis pour l’instant' : 'No reviews yet'}
              </span>
            )}
            <Link
              href={`/${locale}/profil/${offer.creator.id}`}
              className="font-semibold hover:underline"
              style={{ color: '#0d9488' }}
            >
              {reviews && reviews.total > 3
                ? (locale === 'fr' ? `Voir les ${reviews.total} avis →` : `See all ${reviews.total} →`)
                : (locale === 'fr' ? 'Laisser un avis →' : 'Leave a review →')}
            </Link>
          </div>
        </div>

        {reviews && reviews.items.length > 0 ? (
          <ul className="space-y-4">
            {reviews.items.map(r => (
              <li key={r.id} className="border-b pb-4 last:border-b-0 last:pb-0" style={{ borderColor: '#f1f5f9' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#64748b' }}>
                    {r.reviewerFirstName[0]}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>{r.reviewerFirstName}</span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>·</span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString(locale === 'fr' ? 'fr' : 'en')}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5" style={{ color: '#f59e0b' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} className="text-sm">{n <= r.rating ? '★' : '☆'}</span>
                  ))}
                </div>
                {r.comment && (
                  <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic py-2" style={{ color: '#94a3b8' }}>
            {locale === 'fr'
              ? 'Aucun avis pour ce vendeur. Sois le premier à laisser un avis via son profil.'
              : 'No reviews for this seller yet. Be the first to leave one via their profile.'}
          </p>
        )}
      </div>

      {/* Leave a review directly here */}
      <div className="mt-6">
        <ReviewForm
          targetUserId={offer.creator.id}
          targetName={offer.creator.firstName}
          locale={locale}
          existing={myExistingReview}
          onSaved={() => mutateReviews()}
        />
      </div>

      {showInquire && (
        <InquireOfferModal
          offerId={offer.id}
          offerLabel={`${offer.sellCurrency} → ${offer.buyCurrency}`}
          creatorFirstName={offer.creator.firstName}
          locale={locale}
          onClose={() => setShowInquire(false)}
        />
      )}
    </div>
  )
}
