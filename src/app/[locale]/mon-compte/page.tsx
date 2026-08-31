import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getUserOffers } from '@/lib/queries'

function statusColor(status: string) {
  if (status === 'Open') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
  if (status === 'Cancelled') return 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/25'
  if (status === 'Filled') return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/25'
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/25'
}

export default async function AccountPage() {
  const user = await getCurrentUser()
  const t = useTranslations('account')
  const locale = useLocale()

  if (!user) {
    redirect(`/${locale}/auth/connexion`)
  }

  const myOffers = await getUserOffers(user.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="card p-6 mb-8 flex items-center gap-5 flex-wrap">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-deeper text-primary-foreground text-2xl flex items-center justify-center font-extrabold shadow-glow-teal">
          {user.firstName[0]}
        </div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-xl font-bold text-foreground">{user.firstName} {user.lastName}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 rounded-full font-semibold">{user.status}</span>
            <span className="text-xs text-muted-foreground">
              {locale === 'fr' ? 'Pays' : 'Country'}: {user.country}
            </span>
          </div>
        </div>
        <Link href={`/${locale}/creer-offre`}
          className="btn-primary !px-5 !py-2.5 text-sm">
          + {locale === 'fr' ? 'Nouvelle offre' : 'New offer'}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: locale === 'fr' ? 'Transactions' : 'Transactions', value: user.transactionCount },
          { label: locale === 'fr' ? 'Note' : 'Rating', value: user.rating ? `⭐ ${user.rating.toFixed(1)}` : '—' },
        ].map(stat => (
          <div key={stat.label} className="card p-5 text-center">
            <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
        <div className="card p-5 text-center">
          <p className="text-3xl font-extrabold text-primary">🔒</p>
          <p className="text-sm text-muted-foreground mt-1">{locale === 'fr' ? 'Téléphone vérifié' : 'Verified phone'}</p>
        </div>
      </div>

      {/* My offers */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-bold text-lg text-foreground">{t('myOffers')}</h2>
          <Link href={`/${locale}/creer-offre`}
            className="text-sm px-4 py-2 border border-primary/40 text-primary font-semibold rounded-lg hover:bg-primary-light transition-colors">
            {t('createFirst')}
          </Link>
        </div>

        {myOffers.items.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            {locale === 'fr'
              ? 'Vous n\'avez pas encore publié d\'offre.'
              : 'You haven\'t posted any offers yet.'}
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {myOffers.items.map(offer => (
              <div key={offer.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{offer.sellCountryFlag}</div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {offer.sellCurrency} → {offer.buyCurrency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {offer.rate.toLocaleString()} · {offer.remainingAmount.toLocaleString()} {offer.sellCurrencySymbol} {locale === 'fr' ? 'restants' : 'remaining'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(offer.status)}`}>
                    {offer.status}
                  </span>
                  <Link href={`/${locale}/offres/${offer.id}`}
                    className="text-xs text-primary hover:underline underline-offset-2">
                    {locale === 'fr' ? 'Voir' : 'View'} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {myOffers.totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-border/60 text-center">
            <Link href={`/${locale}`} className="text-sm text-primary hover:underline underline-offset-2">
              {locale === 'fr' ? `Voir toutes mes offres (${myOffers.total})` : `View all my offers (${myOffers.total})`}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
