import { useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native'
import { router } from 'expo-router'
import useSWR from 'swr'
import { api } from '@/src/lib/api'
import type { PagedResult, OfferDto, TravelKiloOfferDto, BoatShippingOfferDto } from '@/src/types/api'

type Category = 'devises' | 'kilos' | 'bateau'

const CATS: { key: Category; label: string }[] = [
  { key: 'devises', label: 'Devises' },
  { key: 'kilos',   label: 'Kilos voyage' },
  { key: 'bateau',  label: 'Fret bateau' },
]

export default function HomeScreen() {
  const [cat, setCat] = useState<Category>('devises')
  const [refreshing, setRefreshing] = useState(false)

  const devises = useSWR<PagedResult<OfferDto>>('/api/offers?pageSize=20', (u: string) => api.get<PagedResult<OfferDto>>(u))
  const kilos = useSWR<PagedResult<TravelKiloOfferDto>>('/api/travel-kilo?pageSize=20', (u: string) => api.get<PagedResult<TravelKiloOfferDto>>(u))
  const bateau = useSWR<PagedResult<BoatShippingOfferDto>>('/api/boat-shipping?pageSize=20', (u: string) => api.get<PagedResult<BoatShippingOfferDto>>(u))

  async function onRefresh() {
    setRefreshing(true)
    await Promise.all([devises.mutate(), kilos.mutate(), bateau.mutate()])
    setRefreshing(false)
  }

  const active = cat === 'devises' ? devises : cat === 'kilos' ? kilos : bateau
  const items = active.data?.items ?? []

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row px-3 pt-3 pb-3 gap-2 bg-white border-b border-border">
        {CATS.map(c => {
          const isActive = cat === c.key
          const count = c.key === 'devises' ? devises.data?.total : c.key === 'kilos' ? kilos.data?.total : bateau.data?.total
          return (
            <Pressable
              key={c.key}
              onPress={() => setCat(c.key)}
              className={`px-3 py-2 rounded-xl flex-row items-center gap-1.5 ${isActive ? 'bg-primary' : 'bg-muted'}`}
            >
              <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                {c.label}
              </Text>
              {count !== undefined && (
                <View className={`px-1.5 rounded-full min-w-[20px] items-center ${isActive ? 'bg-white/25' : 'bg-white'}`}>
                  <Text className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-primary'}`}>{count}</Text>
                </View>
              )}
            </Pressable>
          )
        })}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}
      >
        {active.isLoading ? (
          <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
        ) : active.error ? (
          <Text className="text-destructive text-center mt-10">Impossible de charger les offres.</Text>
        ) : items.length === 0 ? (
          <Text className="text-muted-foreground text-center italic mt-10">Aucune offre dans cette catégorie.</Text>
        ) : (
          items.map((offer: OfferDto | TravelKiloOfferDto | BoatShippingOfferDto) =>
            cat === 'devises' ? <DevisesCard key={offer.id} offer={offer as OfferDto} />
            : cat === 'kilos' ? <KilosCard key={offer.id} offer={offer as TravelKiloOfferDto} />
            : <FretCard key={offer.id} offer={offer as BoatShippingOfferDto} />
          )
        )}
      </ScrollView>
    </View>
  )
}

function DevisesCard({ offer }: { offer: OfferDto }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/offers/[id]', params: { id: offer.id } })}
      className="bg-white border border-border rounded-2xl p-4 active:opacity-70"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-dark">{offer.sellCurrency} → {offer.buyCurrency}</Text>
        <View className="bg-primary-light px-2 py-0.5 rounded-full">
          <Text className="text-[11px] font-semibold" style={{ color: '#0f766e' }}>Active</Text>
        </View>
      </View>
      <Text className="text-xs uppercase text-muted-foreground mb-0.5">Taux</Text>
      <Text className="text-xl font-extrabold text-primary mb-2">
        {offer.rateMode === 'Fixed' && offer.rate !== null
          ? `${offer.rate.toLocaleString()} ${offer.sellCurrencySymbol}/${offer.buyCurrencySymbol}`
          : offer.rateMode === 'GoogleDaily' ? 'Taux Google du jour' : 'Taux XE du jour'}
      </Text>
      <Text className="text-xs text-muted-foreground">
        {offer.remainingAmount.toLocaleString()} {offer.sellCurrencySymbol} disponible · min {offer.minAmount.toLocaleString()}
      </Text>
      <View className="mt-3 pt-3 border-t border-border flex-row items-center justify-between">
        <Text className="text-sm font-semibold">{offer.creator.firstName}</Text>
        {offer.creator.reviewCount > 0 ? (
          <Text className="text-xs text-muted-foreground">★ {offer.creator.rating.toFixed(1)} ({offer.creator.reviewCount})</Text>
        ) : (
          <Text className="text-xs italic text-muted-foreground">Nouveau</Text>
        )}
      </View>
    </Pressable>
  )
}

function KilosCard({ offer }: { offer: TravelKiloOfferDto }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/kilos/[id]', params: { id: offer.id } })}
      className="bg-white border border-border rounded-2xl p-4 active:opacity-70"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-dark flex-1" numberOfLines={1}>
          {offer.departureCity} → {offer.destinationCity}
        </Text>
        <View className="bg-primary-light px-2 py-0.5 rounded-full ml-2">
          <Text className="text-[11px] font-semibold" style={{ color: '#0f766e' }}>Actif</Text>
        </View>
      </View>
      <Text className="text-xs uppercase text-muted-foreground mb-0.5">Départ</Text>
      <Text className="text-lg font-extrabold text-primary mb-2">
        {new Date(offer.travelDate).toLocaleDateString('fr', { day: 'numeric', month: 'short', year: 'numeric' })}
      </Text>
      <Text className="text-xs text-muted-foreground">
        {offer.availableKg.toLocaleString()} kg dispo · {offer.pricePerKg.toLocaleString()} /kg
      </Text>
      <View className="mt-3 pt-3 border-t border-border flex-row items-center justify-between">
        <Text className="text-sm font-semibold">{offer.creatorFirstName}</Text>
        {offer.creatorReviewCount > 0 ? (
          <Text className="text-xs text-muted-foreground">★ {offer.creatorRating.toFixed(1)} ({offer.creatorReviewCount})</Text>
        ) : (
          <Text className="text-xs italic text-muted-foreground">Nouveau</Text>
        )}
      </View>
    </Pressable>
  )
}

function FretCard({ offer }: { offer: BoatShippingOfferDto }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/fret/[id]', params: { id: offer.id } })}
      className="bg-white border border-border rounded-2xl p-4 active:opacity-70"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-dark flex-1" numberOfLines={1}>
          {offer.departurePort} → {offer.destinationPort}
        </Text>
        <View className="bg-primary-light px-2 py-0.5 rounded-full ml-2">
          <Text className="text-[11px] font-semibold" style={{ color: '#0f766e' }}>Actif</Text>
        </View>
      </View>
      <Text className="text-xs uppercase text-muted-foreground mb-0.5">Départ bateau</Text>
      <Text className="text-lg font-extrabold text-primary mb-2">
        {new Date(offer.shipDepartureDate).toLocaleDateString('fr', { day: 'numeric', month: 'short', year: 'numeric' })}
      </Text>
      <Text className="text-xs text-muted-foreground">
        {offer.availableLbs.toLocaleString()} lbs dispo · {offer.pricePerLb.toLocaleString()} /lb
      </Text>
      <View className="mt-3 pt-3 border-t border-border flex-row items-center justify-between">
        <Text className="text-sm font-semibold">{offer.creatorFirstName}</Text>
        {offer.creatorReviewCount > 0 ? (
          <Text className="text-xs text-muted-foreground">★ {offer.creatorRating.toFixed(1)} ({offer.creatorReviewCount})</Text>
        ) : (
          <Text className="text-xs italic text-muted-foreground">Nouveau</Text>
        )}
      </View>
    </Pressable>
  )
}
