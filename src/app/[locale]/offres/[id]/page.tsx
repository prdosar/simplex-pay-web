import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { ArrowLeft, Phone, MessageCircle, Lock } from 'lucide-react'
import { flagUrl } from '@/lib/utils'
import { getOfferById } from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [offer, user] = await Promise.all([getOfferById(id), getCurrentUser()])
  const t = useTranslations('offer')
  const locale = useLocale()

  if (!offer) notFound()

  const isAuthenticated = !!user
  const fromMethods = offer.paymentMethods.filter(pm => pm.side === 'From')
  const toMethods = offer.paymentMethods.filter(pm => pm.side === 'To')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href={`/${locale}`} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" />
        {t('back')}
      </Link>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-deeper to-[#0b3b36] p-6 sm:p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-grid-light mask-fade-radial" />
          <div className="absolute -top-20 -right-16 w-[280px] h-[200px] bg-secondary/20 blur-[90px] rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl(offer.sellCountry)} alt={offer.sellCountry} className="w-14 h-10 rounded-lg object-cover shrink-0 ring-2 ring-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{offer.sellCurrency} → {offer.buyCurrency}</p>
                <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flagUrl(offer.buyCountry)} alt={offer.buyCountry} className="w-5 h-3.5 rounded-sm object-cover" />
                  {offer.buyCountry}
                  <span>↔</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flagUrl(offer.sellCountry)} alt={offer.sellCountry} className="w-5 h-3.5 rounded-sm object-cover" />
                  {offer.sellCountry}
                </p>
              </div>
            </div>
            <div className="text-4xl font-extrabold mt-4 tracking-tight">
              {offer.rate.toLocaleString()} <span className="text-xl font-medium text-white/70">{offer.sellCurrencySymbol}/{offer.buyCurrencySymbol}</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Amounts */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-border/60">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">Disponible</p>
              <p className="text-xl font-bold text-foreground">{offer.remainingAmount.toLocaleString()} <span className="text-sm text-muted-foreground">{offer.sellCurrencySymbol}</span></p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">Min</p>
              <p className="text-xl font-bold text-foreground">{offer.minAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">Max</p>
              <p className="text-xl font-bold text-foreground">{offer.maxAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Equivalent */}
          <div className="bg-primary-light border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              {t('buyEquivalent', { currency: offer.buyCurrency })}
            </p>
            <p className="text-2xl font-extrabold text-primary tracking-tight">
              {offer.buyCurrencySymbol} {offer.buyEquivalent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Payment methods */}
          {(fromMethods.length > 0 || toMethods.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-border/60">
              {fromMethods.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-2">{t('paymentFrom')}</p>
                  <div className="flex flex-wrap gap-2">
                    {fromMethods.map((pm, i) => (
                      <span key={i} className="badge-chip !text-xs !px-3 !py-1">
                        {pm.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {toMethods.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-2">{t('paymentTo')}</p>
                  <div className="flex flex-wrap gap-2">
                    {toMethods.map((pm, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-muted border border-border text-foreground rounded-full font-medium">
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
            <div className="mb-6 pb-6 border-b border-border/60">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-2">{t('notes')}</p>
              <p className="text-sm bg-muted border border-border/60 rounded-lg p-3 text-muted-foreground">{offer.notes}</p>
            </div>
          )}

          {/* Seller + contact */}
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-3">{t('creator')}</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-deeper text-primary-foreground text-lg flex items-center justify-center font-extrabold shadow-glow-teal">
                {offer.creator.firstName[0]}
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {offer.creator.firstName} {offer.creator.lastName ?? ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  {offer.creator.transactionCount} {t('transactions')}
                  {offer.creator.rating > 0 && ` · ⭐ ${offer.creator.rating.toFixed(1)}`}
                </p>
              </div>
            </div>

            {/* Contact info */}
            {isAuthenticated ? (
              <div className="bg-muted border border-border/60 rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-3">{t('contactInfo')}</p>
                {offer.creator.phone && (
                  <a href={`tel:${offer.creator.phone}`} className="flex items-center gap-2 text-foreground hover:text-primary font-medium transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                    {offer.creator.phone}
                  </a>
                )}
                {offer.creator.whatsApp && (
                  <a href={`https://wa.me/${offer.creator.whatsApp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-success hover:underline font-medium">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp : {offer.creator.whatsApp}
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-muted border border-border/60 rounded-xl p-6 text-center">
                <span className="inline-flex w-11 h-11 rounded-xl bg-muted border border-border items-center justify-center text-muted-foreground mb-3">
                  <Lock className="w-5 h-5" />
                </span>
                <p className="text-muted-foreground mb-5">{t('loginRequired')}</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link
                    href={`/${locale}/auth/inscription`}
                    className="btn-primary !px-5 !py-2.5 text-sm"
                  >
                    {locale === 'fr' ? "S'inscrire" : 'Sign up'}
                  </Link>
                  <Link
                    href={`/${locale}/auth/connexion`}
                    className="btn-outline !px-5 !py-2.5 text-sm"
                  >
                    {locale === 'fr' ? 'Se connecter' : 'Log in'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
