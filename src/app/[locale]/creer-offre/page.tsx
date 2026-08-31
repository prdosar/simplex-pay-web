import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'
import { getCountries, getCurrencies } from '@/lib/queries'
import CreateOfferForm from './CreateOfferForm'

export default async function CreateOfferPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-lg mb-6 text-muted-foreground">
          {locale === 'fr'
            ? 'Vous devez être connecté pour publier une offre.'
            : 'You must be logged in to post an offer.'}
        </p>
        <Link
          href={`/${locale}/auth/connexion`}
          className="btn-primary !px-6 !py-2.5 text-sm"
        >
          {locale === 'fr' ? 'Se connecter' : 'Log in'}
        </Link>
      </div>
    )
  }

  const [currencies, countries] = await Promise.all([getCurrencies(), getCountries()])
  return <CreateOfferForm locale={locale} currencies={currencies} countries={countries} />
}
