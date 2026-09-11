'use client'

import Link from 'next/link'

interface Props {
  userId: string
  firstName: string
  isCertified: boolean
  rating: number
  reviewCount: number
  locale: string
  linkable?: boolean
}

/** Small trust-signals block for a marketplace user: certified pill, avg stars, review count.
 *  Clickable when linkable=true (default), leading to the user's public profile. */
export default function CreatorTrustBadges({
  userId, firstName, isCertified, rating, reviewCount, locale, linkable = true,
}: Props) {
  const content = (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <span className="text-[13px] font-semibold">{firstName}</span>
      {isCertified && (
        <span
          title={locale === 'fr' ? 'Utilisateur certifié' : 'Certified user'}
          className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-[2px] rounded-full"
          style={{ background: '#ccfbf1', color: '#0f766e' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 2l2.6 2.3 3.5-.5.5 3.5L21 10l-2.4 2.6.5 3.5-3.5.5L13 21l-2.6-2.4-3.5.5-.5-3.5L4 13l2.4-2.6-.5-3.5 3.5-.5L12 2zm-1.2 12.6l6.4-6.4-1.4-1.4-5 5-2.4-2.4-1.4 1.4 3.8 3.8z" />
          </svg>
          {locale === 'fr' ? 'Certifié' : 'Certified'}
        </span>
      )}
      {reviewCount > 0 ? (
        <span className="text-xs" style={{ color: '#64748b' }}>
          ★ {rating.toFixed(1)} <span style={{ color: '#94a3b8' }}>({reviewCount})</span>
        </span>
      ) : (
        <span className="text-xs italic" style={{ color: '#94a3b8' }}>
          {locale === 'fr' ? 'Nouveau' : 'New'}
        </span>
      )}
    </span>
  )

  if (!linkable) return content

  return (
    <Link
      href={`/${locale}/profil/${userId}`}
      onClick={e => e.stopPropagation()}
      className="hover:underline underline-offset-2"
      style={{ color: 'inherit' }}
    >
      {content}
    </Link>
  )
}
