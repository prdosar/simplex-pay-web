'use client'

import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { AdminUserDto } from '@/types/api'

interface Props {
  user: AdminUserDto
  onClose: () => void
  onSaved: (updated: AdminUserDto) => void
}

// Modal admin pour éditer nom/prénom/pays/téléphone/whatsapp d'un user.
// L'email n'est pas éditable (contrainte métier : identifiant + statut de vérification).
export default function EditUserModal({ user, onClose, onSaved }: Props) {
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [country, setCountry] = useState(user.country)
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '')
  const [whatsAppNumber, setWhatsAppNumber] = useState(user.whatsAppNumber ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fermer avec Échap.
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const updated = await api.patch<AdminUserDto>(`/api/admin/users/${user.id}/profile`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country.trim().toUpperCase(),
        phoneNumber: phoneNumber.trim(),
        whatsAppNumber: whatsAppNumber.trim() || null,
      })
      // Backend renvoie UserDto (base) ; on merge avec la ligne existante pour préserver
      // isCertified/rating/reviewCount/createdAt qui viennent de AdminUserDto.
      onSaved({ ...user, ...updated })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Modifier l&apos;utilisateur</h2>
          <button onClick={onClose} className="text-2xl leading-none text-muted-foreground hover:text-slate-900">×</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">Email (non modifiable)</label>
            <input value={user.email} readOnly disabled
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted cursor-not-allowed text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-600">Prénom *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-600">Nom *</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} required
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">Pays (code ISO, ex: TG, CA) *</label>
            <input value={country} onChange={e => setCountry(e.target.value.toUpperCase())} required maxLength={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">Téléphone *</label>
            <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required type="tel"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-600">WhatsApp (optionnel)</label>
            <input value={whatsAppNumber} onChange={e => setWhatsAppNumber(e.target.value)} type="tel"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {error && (
            <div className="text-sm rounded-lg p-2 text-destructive" style={{ background: '#fef2f2' }}>{error}</div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold text-slate-600 hover:bg-muted"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-60"
            >
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
