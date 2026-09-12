import { useState } from 'react'
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import useSWR from 'swr'
import { api } from '@/src/lib/api'
import { useAuth } from '@/src/context/AuthContext'
import type { PagedResult, OfferDto, TravelKiloOfferDto, BoatShippingOfferDto } from '@/src/types/api'

type MyTab = 'devises' | 'kilos' | 'bateau'

export default function AccountScreen() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [tab, setTab] = useState<MyTab>('devises')

  const devises = useSWR<PagedResult<OfferDto>>(
    isAuthenticated ? '/api/offers/me?pageSize=50' : null,
    (u: string) => api.get<PagedResult<OfferDto>>(u)
  )
  const kilos = useSWR<PagedResult<TravelKiloOfferDto>>(
    isAuthenticated ? '/api/travel-kilo/me?pageSize=50' : null,
    (u: string) => api.get<PagedResult<TravelKiloOfferDto>>(u)
  )
  const bateau = useSWR<PagedResult<BoatShippingOfferDto>>(
    isAuthenticated ? '/api/boat-shipping/me?pageSize=50' : null,
    (u: string) => api.get<PagedResult<BoatShippingOfferDto>>(u)
  )

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    )
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mb-4">
          <Text className="text-white text-2xl font-extrabold">S</Text>
        </View>
        <Text className="text-lg font-bold text-dark mb-2">Bienvenue sur SimplexPay</Text>
        <Text className="text-sm text-muted-foreground mb-6 text-center">
          Connecte-toi pour publier des offres et voir tes annonces.
        </Text>
        <View className="w-full max-w-xs gap-2">
          <Pressable
            onPress={() => router.push('/auth/login')}
            className="py-3 bg-primary rounded-xl items-center"
          >
            <Text className="text-white font-bold">Se connecter</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/auth/register')}
            className="py-3 border border-primary rounded-xl items-center"
          >
            <Text className="text-primary font-bold">Créer un compte</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const counts = {
    devises: devises.data?.total ?? 0,
    kilos: kilos.data?.total ?? 0,
    bateau: bateau.data?.total ?? 0,
  }
  const TABS: { key: MyTab; label: string; count: number }[] = [
    { key: 'devises', label: 'Devises',      count: counts.devises },
    { key: 'kilos',   label: 'Kilos',        count: counts.kilos },
    { key: 'bateau',  label: 'Fret',         count: counts.bateau },
  ]

  return (
    <View className="flex-1 bg-white">
      {/* Profile header */}
      <View className="p-6 pb-4 flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
          <Text className="text-white text-xl font-extrabold">{user?.firstName?.[0]}</Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-base font-bold text-dark">{user?.firstName} {user?.lastName}</Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>{user?.email}</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">{user?.country}</Text>
        </View>
        <Pressable
          onPress={() => router.push('/create')}
          className="px-4 py-2 bg-primary rounded-xl"
        >
          <Text className="text-white font-bold text-sm">+ Nouvelle</Text>
        </Pressable>
      </View>

      {!user?.emailVerified && (
        <View className="mx-6 mb-2 border rounded-xl p-3" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
          <Text className="text-xs" style={{ color: '#92400e' }}>
            Ton email n&apos;est pas encore vérifié. Tu ne peux pas créer d&apos;offre.
          </Text>
        </View>
      )}

      {/* Tabs Mes offres */}
      <View className="flex-row px-6 pb-3 gap-2 border-b border-border">
        {TABS.map(t => {
          const isActive = tab === t.key
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              className={`px-3 py-2 rounded-xl flex-row items-center gap-1.5 ${isActive ? 'bg-primary' : 'bg-muted'}`}
            >
              <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-muted-foreground'}`}>{t.label}</Text>
              <View className={`px-1.5 rounded-full min-w-[20px] items-center ${isActive ? 'bg-white/25' : 'bg-white'}`}>
                <Text className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-primary'}`}>{t.count}</Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      {/* Liste offres */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 10 }}>
        {tab === 'devises' && <DevisesList offers={devises.data?.items} loading={devises.isLoading} />}
        {tab === 'kilos'   && <KilosList offers={kilos.data?.items} loading={kilos.isLoading} />}
        {tab === 'bateau'  && <FretList offers={bateau.data?.items} loading={bateau.isLoading} />}
      </ScrollView>

      <Pressable
        onPress={logout}
        className="mx-6 mb-6 py-3 border border-border rounded-xl items-center"
      >
        <Text className="text-destructive font-semibold">Se déconnecter</Text>
      </Pressable>
    </View>
  )
}

function DevisesList({ offers, loading }: { offers?: OfferDto[]; loading: boolean }) {
  if (loading) return <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 20 }} />
  if (!offers?.length) return <Text className="text-center italic text-muted-foreground mt-4">Aucune offre Devises.</Text>
  return <>{offers.map(o => (
    <Pressable
      key={o.id}
      onPress={() => router.push({ pathname: '/offers/[id]', params: { id: o.id } })}
      className="bg-white border border-border rounded-xl p-3 active:opacity-70 flex-row items-center justify-between"
    >
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-bold text-dark">{o.sellCurrency} → {o.buyCurrency}</Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {o.remainingAmount.toLocaleString()} {o.sellCurrencySymbol} · {statusFr(o.status)}
        </Text>
      </View>
      <Text className="text-primary font-bold text-xs">Voir</Text>
    </Pressable>
  ))}</>
}

function KilosList({ offers, loading }: { offers?: TravelKiloOfferDto[]; loading: boolean }) {
  if (loading) return <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 20 }} />
  if (!offers?.length) return <Text className="text-center italic text-muted-foreground mt-4">Aucune offre Kilos.</Text>
  return <>{offers.map(o => (
    <Pressable
      key={o.id}
      onPress={() => router.push({ pathname: '/kilos/[id]', params: { id: o.id } })}
      className="bg-white border border-border rounded-xl p-3 active:opacity-70 flex-row items-center justify-between"
    >
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-bold text-dark" numberOfLines={1}>{o.departureCity} → {o.destinationCity}</Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {o.availableKg} kg · {new Date(o.travelDate).toLocaleDateString('fr', { day: 'numeric', month: 'short' })} · {statusFr(o.status)}
        </Text>
      </View>
      <Text className="text-primary font-bold text-xs">Voir</Text>
    </Pressable>
  ))}</>
}

function FretList({ offers, loading }: { offers?: BoatShippingOfferDto[]; loading: boolean }) {
  if (loading) return <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 20 }} />
  if (!offers?.length) return <Text className="text-center italic text-muted-foreground mt-4">Aucune offre Fret.</Text>
  return <>{offers.map(o => (
    <Pressable
      key={o.id}
      onPress={() => router.push({ pathname: '/fret/[id]', params: { id: o.id } })}
      className="bg-white border border-border rounded-xl p-3 active:opacity-70 flex-row items-center justify-between"
    >
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-bold text-dark" numberOfLines={1}>{o.departurePort} → {o.destinationPort}</Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {o.availableLbs} lbs · {new Date(o.shipDepartureDate).toLocaleDateString('fr', { day: 'numeric', month: 'short' })} · {statusFr(o.status)}
        </Text>
      </View>
      <Text className="text-primary font-bold text-xs">Voir</Text>
    </Pressable>
  ))}</>
}

function statusFr(s: string): string {
  if (s === 'Open') return 'Active'
  if (s === 'PartiallyFilled') return 'Partiel'
  return 'Clôturé'
}
