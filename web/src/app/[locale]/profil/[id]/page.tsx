'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useTranslations, useLocale } from 'next-intl'
import { api } from '@/lib/api'
import { flagUrl } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import ReviewForm from '@/components/reviews/ReviewForm'
import type { UserProfileDto, ReviewDto, PagedResult } from '@/types/api'

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const locale = useLocale()
  const t = useTranslations('profile')
  const { user: me, isAuthenticated } = useAuth()

  const [page, setPage] = useState(1)

  const { data: profile, isLoading: profileLoading, error: profileError } = useSWR<UserProfileDto>(
    `/api/users/${id}/profile`,
    (url: string) => api.get<UserProfileDto>(url)
  )

  const { data: reviews, isLoading: reviewsLoading, mutate: mutateReviews } = useSWR<PagedResult<ReviewDto>>(
    `/api/users/${id}/reviews?page=${page}&pageSize=10`,
    (url: string) => api.get<PagedResult<ReviewDto>>(url)
  )

  const isSelf = me?.id === id
  const canReview = isAuthenticated && me?.emailVerified && !isSelf

  const myExistingReview = me ? reviews?.items.find(r => r.reviewerId === me.id) : undefined

  if (profileLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl mt-4" />
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p style={{ color: '#ef4444' }}>{t('notFound')}</p>
        <Link href={`/${locale}`} className="mt-4 inline-block text-sm hover:underline" style={{ color: '#0d9488' }}>
          ← {t('backHome')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href={`/${locale}`} className="text-sm hover:underline mb-6 inline-block" style={{ color: '#64748b' }}>
        ← {t('backHome')}
      </Link>

      {/* Profile card */}
      <div className="bg-white border rounded-2xl p-6 mb-6" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0" style={{ background: '#0d9488' }}>
            {profile.firstName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>
                {profile.firstName} {profile.lastName ?? ''}
              </h1>
              {profile.isCertified && (
                <span
                  title={t('certifiedTooltip')}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: '#ccfbf1', color: '#0f766e' }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M12 2l2.6 2.3 3.5-.5.5 3.5L21 10l-2.4 2.6.5 3.5-3.5.5L13 21l-2.6-2.4-3.5.5-.5-3.5L4 13l2.4-2.6-.5-3.5 3.5-.5L12 2zm-1.2 12.6l6.4-6.4-1.4-1.4-5 5-2.4-2.4-1.4 1.4 3.8 3.8z" />
                  </svg>
                  {t('certified')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl(profile.country)} alt="" className="w-5 h-3.5 rounded-sm object-cover" />
              <span>{profile.country}</span>
              <span>·</span>
              <span>{t('memberSince', { date: new Date(profile.memberSince).toLocaleDateString(locale === 'fr' ? 'fr' : 'en', { month: 'long', year: 'numeric' }) })}</span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              {profile.reviewCount > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-lg" style={{ color: '#f59e0b' }}>★</span>
                  <span className="font-bold text-lg" style={{ color: '#0f172a' }}>{profile.rating.toFixed(1)}</span>
                  <span style={{ color: '#64748b' }}>({profile.reviewCount} {t('reviewCount', { count: profile.reviewCount })})</span>
                </span>
              ) : (
                <span className="italic" style={{ color: '#94a3b8' }}>{t('noReviewsYet')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <ReviewForm
          targetUserId={id}
          targetName={profile.firstName}
          locale={locale}
          existing={myExistingReview}
          onSaved={() => mutateReviews()}
        />
      </div>

      {/* Reviews list */}
      <div className="bg-white border rounded-2xl p-6" style={{ borderColor: '#e2e8f0' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#0f172a' }}>{t('reviewsTitle')}</h2>

        {reviewsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reviews?.items.length === 0 ? (
          <p className="text-sm italic py-4" style={{ color: '#94a3b8' }}>{t('empty')}</p>
        ) : (
          <ul className="space-y-4">
            {reviews?.items.map(r => (
              <li key={r.id} className="border-b pb-4 last:border-b-0 last:pb-0" style={{ borderColor: '#f1f5f9' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#64748b' }}>
                    {r.reviewerFirstName[0]}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>{r.reviewerFirstName}</span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>·</span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString(locale === 'fr' ? 'fr' : 'en')}</span>
                  {r.updatedAt && (
                    <span className="text-xs italic" style={{ color: '#94a3b8' }}>({t('edited')})</span>
                  )}
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
        )}

        {/* Pagination */}
        {reviews && reviews.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: '#f1f5f9' }}>
            <span className="text-sm" style={{ color: '#64748b' }}>
              {t('pageInfo', { page: reviews.page, total: reviews.totalPages })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:border-[#0d9488] transition-colors"
                style={{ borderColor: '#e2e8f0' }}
              >
                ←
              </button>
              <button
                onClick={() => setPage(p => Math.min(reviews.totalPages, p + 1))}
                disabled={page === reviews.totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:border-[#0d9488] transition-colors"
                style={{ borderColor: '#e2e8f0' }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

