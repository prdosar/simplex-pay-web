import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { api, ApiError } from '@/src/lib/api'
import { useAuth } from '@/src/context/AuthContext'
import type { AuthResponse } from '@/src/types/api'

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const { login } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)

  async function submit() {
    setError('')
    if (code.length !== 6) { setError('Le code doit contenir 6 chiffres.'); return }
    setLoading(true)
    try {
      const auth = await api.post<AuthResponse>('/api/auth/verify-email', { email, code })
      await login(auth)
      router.replace('/(tabs)')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message || 'Code invalide.')
      else setError('Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  async function resend() {
    setError(''); setResent(false); setResending(true)
    try {
      await api.post('/api/auth/resend-code', { email })
      setResent(true)
    } catch {
      setError('Impossible de renvoyer le code, réessaie plus tard.')
    } finally { setResending(false) }
  }

  return (
    <View className="flex-1 bg-white p-6 pt-16">
      <View className="items-center mb-6">
        <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mb-3">
          <Text className="text-white text-2xl">✉</Text>
        </View>
        <Text className="text-2xl font-extrabold text-dark">Vérifie ton email</Text>
        <Text className="text-sm text-muted-foreground mt-1 text-center">
          On a envoyé un code à 6 chiffres à{'\n'}
          <Text className="font-semibold text-dark">{email}</Text>
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>Code de vérification</Text>
        <TextInput
          value={code}
          onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          placeholderTextColor="#94a3b8"
          className="border border-border rounded-xl px-4 py-3 text-2xl bg-white text-center tracking-widest font-bold"
        />
      </View>

      {error ? (
        <View className="mb-4 border rounded-lg p-3" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <Text className="text-sm" style={{ color: '#ef4444' }}>{error}</Text>
        </View>
      ) : null}
      {resent ? (
        <View className="mb-4 border rounded-lg p-3" style={{ borderColor: '#a7f3d0', backgroundColor: '#f0fdf4' }}>
          <Text className="text-sm" style={{ color: '#059669' }}>Nouveau code envoyé.</Text>
        </View>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={loading || code.length !== 6}
        className={`py-3.5 rounded-xl items-center ${loading || code.length !== 6 ? 'bg-primary/60' : 'bg-primary'}`}
      >
        <Text className="text-white font-bold text-base">{loading ? 'Vérification…' : 'Vérifier'}</Text>
      </Pressable>

      <Pressable
        onPress={resend}
        disabled={resending}
        className="mt-4 items-center"
      >
        <Text className="text-sm text-muted-foreground">
          Pas reçu le code ? <Text className="text-primary font-semibold">{resending ? 'Envoi…' : 'Renvoyer'}</Text>
        </Text>
      </Pressable>
    </View>
  )
}
