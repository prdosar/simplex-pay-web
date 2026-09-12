import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native'
import { router } from 'expo-router'
import useSWR, { mutate as globalMutate } from 'swr'
import DateTimePicker from '@react-native-community/datetimepicker'
import { api, ApiError } from '@/src/lib/api'
import { useAuth } from '@/src/context/AuthContext'
import type { CountryDto } from '@/src/types/api'

type Category = 'kilos' | 'bateau' | 'devises'

export default function CreateScreen() {
  const { user, isAuthenticated } = useAuth()
  const [cat, setCat] = useState<Category>('kilos')

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-muted-foreground mb-4">Connecte-toi d&apos;abord.</Text>
        <Pressable onPress={() => router.replace('/auth/login')} className="px-5 py-2.5 bg-primary rounded-xl">
          <Text className="text-white font-bold">Se connecter</Text>
        </Pressable>
      </View>
    )
  }
  if (!user?.emailVerified) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-lg font-bold text-dark mb-2">Email non vérifié</Text>
        <Text className="text-muted-foreground text-center mb-4">
          Vérifie ton email pour publier des offres.
        </Text>
        <Pressable
          onPress={() => router.push({ pathname: '/auth/verify', params: { email: user?.email } })}
          className="px-5 py-2.5 bg-primary rounded-xl"
        >
          <Text className="text-white font-bold">Vérifier mon email</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <View className="flex-row gap-2 mb-4">
        {(['kilos', 'bateau', 'devises'] as const).map(c => (
          <Pressable
            key={c}
            onPress={() => setCat(c)}
            className={`flex-1 px-3 py-2.5 rounded-xl items-center ${cat === c ? 'bg-primary' : 'bg-muted'}`}
          >
            <Text className={`text-sm font-semibold ${cat === c ? 'text-white' : 'text-muted-foreground'}`}>
              {c === 'kilos' ? 'Kilos' : c === 'bateau' ? 'Fret' : 'Devises'}
            </Text>
          </Pressable>
        ))}
      </View>

      {cat === 'kilos' && <KilosForm />}
      {cat === 'bateau' && <FretForm />}
      {cat === 'devises' && (
        <View className="p-6 border border-border rounded-2xl bg-muted items-center">
          <Text className="text-sm text-muted-foreground text-center">
            Le formulaire Devises arrive bientôt. En attendant, publie via le site web.
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

function KilosForm() {
  const { user } = useAuth()
  const { data: countries } = useSWR<CountryDto[]>('/api/countries', (u: string) => api.get<CountryDto[]>(u))

  const [availableKg, setAvailableKg] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [travelDate, setTravelDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const [showDate, setShowDate] = useState(false)
  const [departureCity, setDepartureCity] = useState('')
  const [destinationCity, setDestinationCity] = useState('')
  const [departureCountry, setDepartureCountry] = useState(user?.country ?? 'TG')
  const [destinationCountry, setDestinationCountry] = useState('CA')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    if (!availableKg || !pricePerKg || !departureCity || !destinationCity) {
      setError('Remplis les champs obligatoires.')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/travel-kilo', {
        availableKg: parseFloat(availableKg),
        pricePerKg: parseFloat(pricePerKg),
        travelDate: travelDate.toISOString(),
        departureCity,
        destinationCity,
        departureCountryCode: departureCountry,
        destinationCountryCode: destinationCountry,
        notes: notes.trim() || null,
      })
      // Invalidate /me + list caches — le user verra la nouvelle offre au retour.
      globalMutate('/api/travel-kilo/me?pageSize=50')
      globalMutate('/api/travel-kilo?pageSize=20')
      Alert.alert('Publiée !', 'Ton offre Kilos est en ligne.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/two') },
      ])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la publication.')
    } finally { setLoading(false) }
  }

  return (
    <View>
      <FormLabel>Kilos disponibles *</FormLabel>
      <TextInput value={availableKg} onChangeText={setAvailableKg} keyboardType="decimal-pad" placeholder="ex: 23" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 mb-3 text-base bg-white" />

      <FormLabel>Prix par kilo *</FormLabel>
      <TextInput value={pricePerKg} onChangeText={setPricePerKg} keyboardType="decimal-pad" placeholder="ex: 8000" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 mb-3 text-base bg-white" />

      <FormLabel>Date de départ *</FormLabel>
      <Pressable onPress={() => setShowDate(true)} className="border border-border rounded-xl px-4 py-3 mb-3 bg-white">
        <Text className="text-base">{travelDate.toLocaleDateString('fr', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      </Pressable>
      {showDate && (
        <DateTimePicker
          value={travelDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, d) => {
            setShowDate(Platform.OS === 'ios')
            if (d) setTravelDate(d)
          }}
        />
      )}

      <View className="flex-row gap-2 mb-3">
        <View className="flex-1">
          <FormLabel>Ville départ *</FormLabel>
          <TextInput value={departureCity} onChangeText={setDepartureCity} placeholder="Lomé" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 text-base bg-white" />
        </View>
        <View className="flex-1">
          <FormLabel>Ville arrivée *</FormLabel>
          <TextInput value={destinationCity} onChangeText={setDestinationCity} placeholder="Montréal" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 text-base bg-white" />
        </View>
      </View>

      <CountryDropdown label="Pays de départ" value={departureCountry} onChange={setDepartureCountry} countries={countries ?? []} />
      <CountryDropdown label="Pays de destination" value={destinationCountry} onChange={setDestinationCountry} countries={countries ?? []} />

      <FormLabel>Notes (optionnel)</FormLabel>
      <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3} placeholder="Précisions sur le voyage…" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 mb-3 text-base bg-white" style={{ textAlignVertical: 'top', minHeight: 80 }} />

      {error ? <Text className="text-destructive text-sm mb-3">{error}</Text> : null}

      <Pressable
        onPress={submit}
        disabled={loading}
        className={`py-3.5 rounded-xl items-center ${loading ? 'bg-primary/60' : 'bg-primary'}`}
      >
        <Text className="text-white font-bold text-base">{loading ? 'Publication…' : 'Publier l\'offre'}</Text>
      </Pressable>
    </View>
  )
}

function FretForm() {
  const { user } = useAuth()
  const { data: countries } = useSWR<CountryDto[]>('/api/countries', (u: string) => api.get<CountryDto[]>(u))

  const [availableLbs, setAvailableLbs] = useState('')
  const [pricePerLb, setPricePerLb] = useState('')
  const [shipDate, setShipDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
  const [showDate, setShowDate] = useState(false)
  const [departurePort, setDeparturePort] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  const [departureCountry, setDepartureCountry] = useState(user?.country ?? 'TG')
  const [destinationCountry, setDestinationCountry] = useState('CA')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    if (!availableLbs || !pricePerLb || !departurePort || !destinationPort) {
      setError('Remplis les champs obligatoires.')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/boat-shipping', {
        availableLbs: parseFloat(availableLbs),
        pricePerLb: parseFloat(pricePerLb),
        shipDepartureDate: shipDate.toISOString(),
        departurePort,
        destinationPort,
        departureCountryCode: departureCountry,
        destinationCountryCode: destinationCountry,
        notes: notes.trim() || null,
      })
      globalMutate('/api/boat-shipping/me?pageSize=50')
      globalMutate('/api/boat-shipping?pageSize=20')
      Alert.alert('Publiée !', 'Ton offre Fret est en ligne.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/two') },
      ])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la publication.')
    } finally { setLoading(false) }
  }

  return (
    <View>
      <FormLabel>Livres disponibles *</FormLabel>
      <TextInput value={availableLbs} onChangeText={setAvailableLbs} keyboardType="decimal-pad" placeholder="ex: 100" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 mb-3 text-base bg-white" />

      <FormLabel>Prix par livre *</FormLabel>
      <TextInput value={pricePerLb} onChangeText={setPricePerLb} keyboardType="decimal-pad" placeholder="ex: 3" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 mb-3 text-base bg-white" />

      <FormLabel>Date de départ bateau *</FormLabel>
      <Pressable onPress={() => setShowDate(true)} className="border border-border rounded-xl px-4 py-3 mb-3 bg-white">
        <Text className="text-base">{shipDate.toLocaleDateString('fr', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      </Pressable>
      {showDate && (
        <DateTimePicker
          value={shipDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, d) => {
            setShowDate(Platform.OS === 'ios')
            if (d) setShipDate(d)
          }}
        />
      )}

      <View className="flex-row gap-2 mb-3">
        <View className="flex-1">
          <FormLabel>Port départ *</FormLabel>
          <TextInput value={departurePort} onChangeText={setDeparturePort} placeholder="Lomé" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 text-base bg-white" />
        </View>
        <View className="flex-1">
          <FormLabel>Port arrivée *</FormLabel>
          <TextInput value={destinationPort} onChangeText={setDestinationPort} placeholder="Montréal" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 text-base bg-white" />
        </View>
      </View>

      <CountryDropdown label="Pays de départ" value={departureCountry} onChange={setDepartureCountry} countries={countries ?? []} />
      <CountryDropdown label="Pays de destination" value={destinationCountry} onChange={setDestinationCountry} countries={countries ?? []} />

      <FormLabel>Notes (optionnel)</FormLabel>
      <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3} placeholder="Précisions sur l&apos;expédition…" placeholderTextColor="#94a3b8" className="border border-border rounded-xl px-4 py-3 mb-3 text-base bg-white" style={{ textAlignVertical: 'top', minHeight: 80 }} />

      {error ? <Text className="text-destructive text-sm mb-3">{error}</Text> : null}

      <Pressable
        onPress={submit}
        disabled={loading}
        className={`py-3.5 rounded-xl items-center ${loading ? 'bg-primary/60' : 'bg-primary'}`}
      >
        <Text className="text-white font-bold text-base">{loading ? 'Publication…' : 'Publier l\'offre'}</Text>
      </Pressable>
    </View>
  )
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <Text className="text-xs uppercase font-bold text-muted-foreground mb-1.5">{children}</Text>
}

function CountryDropdown({
  label, value, onChange, countries,
}: {
  label: string
  value: string
  onChange: (code: string) => void
  countries: CountryDto[]
}) {
  const [open, setOpen] = useState(false)
  const selected = countries.find(c => c.code === value)
  return (
    <View className="mb-3">
      <FormLabel>{label}</FormLabel>
      <Pressable onPress={() => setOpen(v => !v)} className="border border-border rounded-xl px-4 py-3 bg-white flex-row items-center justify-between">
        <Text className="text-base">{selected ? selected.nameFr : value}</Text>
        <Text className="text-muted-foreground">▾</Text>
      </Pressable>
      {open && (
        <View className="mt-1 border border-border rounded-xl bg-white max-h-64 overflow-hidden">
          <ScrollView nestedScrollEnabled>
            {countries.map(c => (
              <Pressable
                key={c.code}
                onPress={() => { onChange(c.code); setOpen(false) }}
                className="px-4 py-3 border-b border-border"
              >
                <Text className={value === c.code ? 'text-primary font-bold' : 'text-dark'}>
                  {c.nameFr} ({c.currencyCode})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
