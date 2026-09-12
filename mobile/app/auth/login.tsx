import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { api, ApiError } from '@/src/lib/api'
import { useAuth } from '@/src/context/AuthContext'
import type { AuthResponse } from '@/src/types/api'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    setLoading(true)
    try {
      const auth = await api.post<AuthResponse>('/api/auth/login', { email, password })
      await login(auth)
      router.replace('/(tabs)')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Email ou mot de passe incorrect.')
      } else {
        setError('Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
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

      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1.5" style={{ color: '#334155' }}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
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
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          className="border border-border rounded-xl px-4 py-3 text-base bg-white"
        />
      </View>

      {error ? (
        <View className="mb-4 border rounded-lg p-3" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <Text className="text-sm" style={{ color: '#ef4444' }}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={loading || !email || !password}
        className={`py-3.5 rounded-xl items-center ${loading || !email || !password ? 'bg-primary/60' : 'bg-primary'}`}
      >
        <Text className="text-white font-bold text-base">
          {loading ? 'Connexion…' : 'Se connecter'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => Alert.alert('Bientôt', 'Inscription arrive dans la prochaine version.')}
        className="mt-6 items-center"
      >
        <Text className="text-sm text-muted-foreground">
          Pas de compte ? <Text className="text-primary font-semibold">S&apos;inscrire</Text>
        </Text>
      </Pressable>
    </ScrollView>
  )
}
