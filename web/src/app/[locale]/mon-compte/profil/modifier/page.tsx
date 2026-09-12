'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useCountries } from '@/lib/useCountries'
import CountrySelect from '@/components/ui/CountrySelect'
import type { UserDto } from '@/types/api'

const INPUT = 'w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]'
const LABEL = 'block text-sm font-semibold mb-1.5'

export default function EditProfilePage() {
  const locale = useLocale()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const { data: countries } = useCountries()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [whatsAppNumber, setWhatsAppNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Pré-remplir avec les valeurs actuelles quand le user est hydraté.
  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setCountry(user.country)
    setPhoneNumber(user.phoneNumber ?? '')
    setWhatsAppNumber(user.whatsAppNumber ?? '')
  }, [user])

  if (authLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse"><div className="h-96 bg-gray-100 rounded-2xl" /></div>
  }
  if (!isAuthenticated) {
    router.replace(`/${locale}/auth/connexion`)
    return null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(false); setLoading(true)
    try {
      const updated = await api.patch<UserDto>('/api/users/me/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country,
        phoneNumber: phoneNumber.trim(),
        whatsAppNumber: whatsAppNumber.trim() || null,
      })
      // Met à jour le contexte + localStorage pour refléter partout instantanément.
      refreshUser?.(updated)
      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/mon-compte`), 900)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (locale === 'fr' ? 'Erreur lors de la sauvegarde.' : 'Save failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/${locale}/mon-compte`} className="text-sm hover:underline mb-4 inline-block" style={{ color: '#64748b' }}>
        ← {locale === 'fr' ? 'Retour au compte' : 'Back to account'}
      </Link>

      <div className="bg-white border rounded-2xl p-6" style={{ borderColor: '#e2e8f0' }}>
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#0f172a' }}>
          {locale === 'fr' ? 'Modifier mon profil' : 'Edit my profile'}
        </h1>
        <p className="text-sm mb-6" style={{ color: '#64748b' }}>
          {locale === 'fr'
            ? 'Change ton nom, ton pays ou ton numéro. L\'email n\'est pas modifiable.'
            : 'Update your name, country or phone number. Email cannot be changed.'}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {/* Email — lecture seule */}
          <div>
            <label className={LABEL} style={{ color: '#334155' }}>Email</label>
            <input value={user?.email ?? ''} readOnly disabled
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm bg-[#f8fafc] cursor-not-allowed"
              style={{ color: '#64748b' }}
            />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              {locale === 'fr' ? 'Contact le support pour changer d\'email.' : 'Contact support to change email.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL} style={{ color: '#334155' }}>{locale === 'fr' ? 'Prénom' : 'First name'} *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} required className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#334155' }}>{locale === 'fr' ? 'Nom' : 'Last name'} *</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} required className={INPUT} />
            </div>
          </div>

          <div>
            <label className={LABEL} style={{ color: '#334155' }}>{locale === 'fr' ? 'Pays' : 'Country'} *</label>
            <CountrySelect
              value={country}
              onChange={setCountry}
              countries={countries ?? []}
              locale={locale}
              allowEmpty={false}
              placeholder={locale === 'fr' ? 'Sélectionne un pays' : 'Select a country'}
            />
          </div>

          <div>
            <label className={LABEL} style={{ color: '#334155' }}>{locale === 'fr' ? 'Téléphone' : 'Phone'} *</label>
            <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required type="tel" className={INPUT} placeholder="+228 90 00 00 00" />
          </div>

          <div>
            <label className={LABEL} style={{ color: '#334155' }}>WhatsApp <span className="font-normal" style={{ color: '#94a3b8' }}>({locale === 'fr' ? 'optionnel' : 'optional'})</span></label>
            <input value={whatsAppNumber} onChange={e => setWhatsAppNumber(e.target.value)} type="tel" className={INPUT} placeholder="+228 90 00 00 00" />
          </div>

          {error && (
            <div className="text-sm rounded-lg p-3 border" style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm rounded-lg p-3 border" style={{ color: '#059669', background: '#f0fdf4', borderColor: '#a7f3d0' }}>
              {locale === 'fr' ? 'Profil mis à jour ✓' : 'Profile updated ✓'}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-white font-bold rounded-lg transition-colors disabled:opacity-60"
              style={{ background: '#0d9488' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0f766e' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0d9488' }}
            >
              {loading ? (locale === 'fr' ? 'Enregistrement…' : 'Saving…') : (locale === 'fr' ? 'Enregistrer' : 'Save')}
            </button>
            <Link
              href={`/${locale}/mon-compte`}
              className="px-5 py-3 border rounded-lg text-sm font-semibold text-center"
              style={{ borderColor: '#e2e8f0', color: '#64748b' }}
            >
              {locale === 'fr' ? 'Annuler' : 'Cancel'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
