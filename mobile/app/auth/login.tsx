import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { api, ApiError } from '@/src/lib/api'
import { useAuth } from '@/src/context/AuthContext'
import type { AuthResponse } from '@/src/types/api'

interface LoginResponse { requiresTwoFactor: boolean; email: string; codeExpiryMinutes: number }
type Step = 'credentials' | 'code'

export default function LoginScreen() {
  const { login } = useAuth()
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeExpiryMinutes, setCodeExpiryMinutes] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError(''); setLoading(true)
    try {
      if (step === 'credentials') {
        const res = await api.post<LoginResponse>('/api/auth/login', { email, password })
        setCodeExpiryMinutes(res.codeExpiryMinutes)
        setStep('code')
      } else {
        const auth = await api.post<AuthResponse>('/api/auth/login-verify', { email, code })
        await login(auth)
        router.replace('/(tabs)')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError('Email ou mot de passe incorrect.')
        else if (err.status === 403) setError(err.message || 'Code invalide ou expiré.')
        else setError('Une erreur est survenue.')
      } else {
        setError('Une erreur est survenue.')
      }
    } finally { setLoading(false) }
  }

  async function resendCode() {
    setError(''); setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password })
      setCodeExpiryMinutes(res.codeExpiryMinutes)
      setCode('')
    } catch {
      setError('Impossible de renvoyer le code.')
    } finally { setLoading(false) }
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <View className="items-center mb-8">
        <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mb-4">
          <Text className="text-white text-2xl font-extrabold">SP</Text>
        </View>
        <Text className="text-2xl font-extrabold text-dark">
          <Text className="text-primary">Simplex</Text>Pay
        </Text>
        <Text className="text-sm text-muted-foreground mt-1">Marketplace P2P diaspora</Text>
      </View>

      {step === 'credentials' ? (
        <>
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="vous@email.com"
              placeholderTextColor="#94a3b8"
              className="border border-border rounded-xl px-4 py-3 text-base bg-white"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>Mot de passe</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              className="border border-border rounded-xl px-4 py-3 text-base bg-white"
            />
          </View>
        </>
      ) : (
        <>
          <Text className="text-sm mb-4" style={{ color: '#64748b' }}>
            Un code à 6 chiffres a été envoyé à{' '}
            <Text className="font-semibold" style={{ color: '#0f172a' }}>{email}</Text>.
            Il expire dans {codeExpiryMinutes} min.
          </Text>
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>Code de vérification</Text>
            <TextInput
              value={code}
              onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              placeholderTextColor="#94a3b8"
              className="border border-border rounded-xl px-4 py-3 text-2xl text-center tracking-widest font-bold bg-white"
            />
          </View>
        </>
      )}

      {error ? (
        <View className="mb-4 border rounded-lg p-3" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <Text className="text-sm" style={{ color: '#ef4444' }}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={loading || !email || (step === 'credentials' ? !password : code.length !== 6)}
        className={`py-3.5 rounded-xl items-center ${loading || !email || (step === 'credentials' ? !password : code.length !== 6) ? 'bg-primary/60' : 'bg-primary'}`}
      >
        <Text className="text-white font-bold text-base">
          {loading
            ? (step === 'credentials' ? 'Envoi du code…' : 'Vérification…')
            : (step === 'credentials' ? 'Continuer' : 'Se connecter')}
        </Text>
      </Pressable>

      {step === 'code' ? (
        <View className="flex-row items-center justify-between mt-4">
          <Pressable onPress={() => { setStep('credentials'); setCode(''); setError('') }}>
            <Text className="text-sm text-muted-foreground font-medium">← Changer identifiants</Text>
          </Pressable>
          <Pressable onPress={resendCode} disabled={loading}>
            <Text className="text-sm text-primary font-semibold">Renvoyer le code</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => router.push('/auth/register')} className="mt-6 items-center">
          <Text className="text-sm text-muted-foreground">
            Pas de compte ? <Text className="text-primary font-semibold">S&apos;inscrire</Text>
          </Text>
        </Pressable>
      )}
    </ScrollView>
  )
}
