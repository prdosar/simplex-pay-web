'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useLocale } from 'next-intl'
import { api } from '@/lib/api'
import { flagUrl } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import ReviewForm from '@/components/reviews/ReviewForm'
import type { TravelKiloOfferDto, PagedResult, ReviewDto } from '@/types/api'

export default function TravelKiloDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const locale = useLocale()
  const { isAuthenticated, user: me } = useAuth()
  const [reviewsPage, setReviewsPage] = useState(1)

  const { data: offer, isLoading, error } = useSWR<TravelKiloOfferDto>(
    `/api/travel-kilo/${id}`,
    (url: string) => api.get<TravelKiloOfferDto>(url)
  )

  const { data: reviews, mutate: mutateReviews } = useSWR<PagedResult<ReviewDto>>(
    offer ? `/api/users/${offer.creatorId}/reviews?page=${reviewsPage}&pageSize=5` : null,
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
      <p style={{ color: '#ef4444' }}>{locale === 'fr' ? 'Offre introuvable.' : 'Offer not found.'}</p>
      <Link href={`/${locale}`} className="mt-4 inline-block text-sm hover:underline" style={{ color: '#0d9488' }}>
        ← {locale === 'fr' ? 'Retour' : 'Back'}
      </Link>
    </div>
  )

  const dateStr = new Date(offer.travelDate).toLocaleDateString(
    locale === 'fr' ? 'fr' : 'en',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href={`/${locale}`} className="text-sm hover:underline mb-6 inline-block" style={{ color: '#64748b' }}>
        ← {locale === 'fr' ? 'Retour aux offres' : 'Back to offers'}
      </Link>

      <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        {/* Header: route */}
        <div className="p-6 text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl(offer.departureCountryCode)} alt="" className="w-10 h-7 rounded object-cover shadow ring-2 ring-white/40" />
              <span className="text-2xl font-bold">{offer.departureCity}</span>
            </div>
            <svg className="w-6 h-6 opacity-80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl(offer.destinationCountryCode)} alt="" className="w-10 h-7 rounded object-cover shadow ring-2 ring-white/40" />
              <span className="text-2xl font-bold">{offer.destinationCity}</span>
            </div>
          </div>
          <p className="text-white/85 text-sm">{locale === 'fr' ? 'Départ le' : 'Departure'} <span className="font-semibold text-white">{dateStr}</span></p>
        </div>

        <div className="p-6">
          {/* Kg + Price */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b" style={{ borderColor: '#f1f5f9' }}>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#64748b' }}>{locale === 'fr' ? 'Kilos disponibles' : 'Available kg'}</p>
              <p className="text-2xl font-extrabold" style={{ color: '#0d9488' }}>{offer.availableKg.toLocaleString()} <span className="text-sm font-medium" style={{ color: '#64748b' }}>kg</span></p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#64748b' }}>{locale === 'fr' ? 'Prix par kilo' : 'Price per kg'}</p>
              <p className="text-2xl font-extrabold" style={{ color: '#0d9488' }}>{offer.pricePerKg.toLocaleString()}<span className="text-sm font-medium" style={{ color: '#64748b' }}> / kg</span></p>
            </div>
          </div>

          {/* Notes */}
          {offer.notes && (
            <div className="mb-6 pb-6 border-b" style={{ borderColor: '#f1f5f9' }}>
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#64748b' }}>{locale === 'fr' ? 'Notes' : 'Notes'}</p>
              <p className="text-sm rounded-lg p-3" style={{ background: '#f8fafc', color: '#334155' }}>{offer.notes}</p>
            </div>
          )}

          {/* Creator */}
          <div>
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#64748b' }}>{locale === 'fr' ? 'Voyageur' : 'Traveler'}</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full text-white text-lg flex items-center justify-center font-bold shrink-0" style={{ background: '#0d9488' }}>
                {offer.creatorFirstName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/${locale}/profil/${offer.creatorId}`} className="font-semibold hover:underline" style={{ color: '#0f172a' }}>
                    {offer.creatorFirstName}
                  </Link>
                  {offer.creatorIsCertified && (
                    <span title={locale === 'fr' ? 'Utilisateur certifié' : 'Certified user'}
                      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-[3px] rounded-full"
                      style={{ background: '#ccfbf1', color: '#0f766e' }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M12 2l2.6 2.3 3.5-.5.5 3.5L21 10l-2.4 2.6.5 3.5-3.5.5L13 21l-2.6-2.4-3.5.5-.5-3.5L4 13l2.4-2.6-.5-3.5 3.5-.5L12 2z" />
                      </svg>
                      {locale === 'fr' ? 'Certifié' : 'Certified'}
                    </span>
                  )}
                </div>
                <p className="text-sm flex items-center gap-1.5 flex-wrap" style={{ color: '#64748b' }}>
                  {offer.creatorReviewCount > 0 ? (
                    <>
                      <span style={{ color: '#f59e0b' }}>★ {offer.creatorRating.toFixed(1)}</span>
                      <span>({offer.creatorReviewCount} {locale === 'fr' ? 'avis' : 'reviews'})</span>
                    </>
                  ) : (
                    <span className="italic">{locale === 'fr' ? 'Aucun avis' : 'No reviews yet'}</span>
                  )}
                </p>
                <Link href={`/${locale}/profil/${offer.creatorId}`} className="inline-flex items-center gap-1 mt-1 text-xs font-semibold hover:underline" style={{ color: '#0d9488' }}>
                  {locale === 'fr' ? 'Voir le profil complet →' : 'View full profile →'}
                </Link>
              </div>
            </div>

            {/* Contact */}
            {isAuthenticated ? (
              <div className="rounded-xl p-4 space-y-2" style={{ background: '#f8fafc' }}>
                <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#64748b' }}>{locale === 'fr' ? 'Contact' : 'Contact info'}</p>
                {offer.creatorPhone && (
                  <a href={`tel:${offer.creatorPhone}`} className="flex items-center gap-2 font-medium hover:text-[#0d9488]" style={{ color: '#0f172a' }}>
                    📞 {offer.creatorPhone}
                  </a>
                )}
                {offer.creatorWhatsApp && (
                  <a href={`https://wa.me/${offer.creatorWhatsApp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-medium hover:underline" style={{ color: '#16a34a' }}>
                    💬 WhatsApp: {offer.creatorWhatsApp}
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-5 text-center" style={{ background: '#f8fafc' }}>
                <p className="mb-4" style={{ color: '#64748b' }}>🔒 {locale === 'fr' ? 'Connectez-vous pour voir le contact' : 'Log in to see contact info'}</p>
                <div className="flex gap-3 justify-center">
                  <Link href={`/${locale}/auth/inscription`} className="px-5 py-2.5 text-white font-semibold rounded-lg" style={{ background: '#0d9488' }}>
                    {locale === 'fr' ? "S'inscrire" : 'Sign up'}
                  </Link>
                  <Link href={`/${locale}/auth/connexion`} className="px-5 py-2.5 border rounded-lg hover:border-[#0d9488]" style={{ borderColor: '#e2e8f0', color: '#0f172a' }}>
                    {locale === 'fr' ? 'Se connecter' : 'Log in'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews about the seller (last 5) */}
      <div className="mt-6 bg-white border rounded-2xl p-6" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>
            {locale === 'fr' ? `Avis sur ${offer.creatorFirstName}` : `Reviews about ${offer.creatorFirstName}`}
          </h2>
          {reviews && reviews.total > 5 && (
            <Link href={`/${locale}/profil/${offer.creatorId}`} className="text-sm font-semibold hover:underline" style={{ color: '#0d9488' }}>
              {locale === 'fr' ? `Voir les ${reviews.total} avis →` : `See all ${reviews.total} →`}
            </Link>
          )}
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
                  {[1, 2, 3, 4, 5].map(n => <span key={n} className="text-sm">{n <= r.rating ? '★' : '☆'}</span>)}
                </div>
                {r.comment && <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic py-2" style={{ color: '#94a3b8' }}>
            {locale === 'fr' ? 'Aucun avis pour ce voyageur. Sois le premier.' : 'No reviews yet. Be the first.'}
          </p>
        )}
      </div>

      {/* Leave a review directly here */}
      <div className="mt-6">
        <ReviewForm
          targetUserId={offer.creatorId}
          targetName={offer.creatorFirstName}
          locale={locale}
          existing={myExistingReview}
          onSaved={() => mutateReviews()}
        />
      </div>
    </div>
  )
}
