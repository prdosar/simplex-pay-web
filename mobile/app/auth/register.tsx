import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { router } from 'expo-router'
import useSWR from 'swr'
import { api, ApiError } from '@/src/lib/api'
import type { CountryDto } from '@/src/types/api'

// L'API renvoie 201 avec AuthResponse dès l'inscription, MAIS emailVerified=false.
// Le user doit d'abord saisir le code envoyé par email → écran verify-email.

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string
  country: string
  whatsAppNumber?: string
}

export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterForm>({
    firstName: '', lastName: '', email: '', password: '', phoneNumber: '', country: 'TG',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCountries, setShowCountries] = useState(false)

  const { data: countries } = useSWR<CountryDto[]>('/api/countries', (u: string) => api.get<CountryDto[]>(u))
  const selectedCountry = countries?.find(c => c.code === form.country)

  function update<K extends keyof RegisterForm>(k: K, v: RegisterForm[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submit() {
    setError('')
    if (form.password.length < 8) { setError('Mot de passe : min 8 caractères, une majuscule, un chiffre.'); return }
    if (!/[A-Z]/.test(form.password)) { setError('Le mot de passe doit contenir au moins une majuscule.'); return }
    if (!/[0-9]/.test(form.password)) { setError('Le mot de passe doit contenir au moins un chiffre.'); return }
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      // Register créé le user (email non vérifié). Redirect vers verify avec l'email en param.
      router.replace({ pathname: '/auth/verify', params: { email: form.email } })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Erreur à l\'inscription.')
      } else {
        setError('Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <View className="items-center mb-6">
        <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mb-3">
          <Text className="text-white text-2xl font-extrabold">SP</Text>
        </View>
        <Text className="text-2xl font-extrabold text-dark">Créer un compte</Text>
      </View>

      <Field label="Prénom" value={form.firstName} onChange={v => update('firstName', v)} />
      <Field label="Nom" value={form.lastName} onChange={v => update('lastName', v)} />
      <Field label="Email" value={form.email} onChange={v => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Mot de passe" value={form.password} onChange={v => update('password', v)} secureTextEntry />
      <Field label="Téléphone" value={form.phoneNumber} onChange={v => update('phoneNumber', v)} keyboardType="phone-pad" />
      <Field label="WhatsApp (optionnel)" value={form.whatsAppNumber ?? ''} onChange={v => update('whatsAppNumber', v)} keyboardType="phone-pad" />

      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>Pays</Text>
        <Pressable
          onPress={() => setShowCountries(v => !v)}
          className="border border-border rounded-xl px-4 py-3 bg-white flex-row items-center justify-between"
        >
          <Text className="text-base">{selectedCountry ? selectedCountry.nameFr : form.country}</Text>
          <Text className="text-muted-foreground">▾</Text>
        </Pressable>
        {showCountries && (
          <View className="mt-1 border border-border rounded-xl bg-white max-h-64 overflow-hidden">
            <ScrollView>
              {countries?.map(c => (
                <Pressable
                  key={c.code}
                  onPress={() => { update('country', c.code); setShowCountries(false) }}
                  className="px-4 py-3 border-b border-border"
                >
                  <Text className={form.country === c.code ? 'text-primary font-bold' : 'text-dark'}>
                    {c.nameFr} ({c.currencyCode})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {error ? (
        <View className="mb-4 border rounded-lg p-3" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <Text className="text-sm" style={{ color: '#ef4444' }}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={loading}
        className={`py-3.5 rounded-xl items-center ${loading ? 'bg-primary/60' : 'bg-primary'}`}
      >
        <Text className="text-white font-bold text-base">{loading ? 'Création…' : 'Créer mon compte'}</Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/auth/login')} className="mt-6 items-center">
        <Text className="text-sm text-muted-foreground">
          Déjà un compte ? <Text className="text-primary font-semibold">Se connecter</Text>
        </Text>
      </Pressable>
    </ScrollView>
  )
}

function Field({
  label, value, onChange, secureTextEntry, keyboardType, autoCapitalize,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words'
}) {
  return (
    <View className="mb-3">
      <Text className="text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#94a3b8"
        className="border border-border rounded-xl px-4 py-3 text-base bg-white"
      />
    </View>
  )
}
