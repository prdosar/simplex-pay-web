import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import useSWR from 'swr'
import { api } from '@/src/lib/api'
import { useAuth } from '@/src/context/AuthContext'
import CreatorCard from '@/src/components/CreatorCard'
import type { BoatShippingOfferDto } from '@/src/types/api'

export default function BoatShippingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isAuthenticated } = useAuth()

  const { data: offer, isLoading, error } = useSWR<BoatShippingOfferDto>(
    id ? `/api/boat-shipping/${id}` : null,
    (u: string) => api.get<BoatShippingOfferDto>(u)
  )

  if (isLoading) return <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
  if (error || !offer) {
    return <View className="flex-1 items-center justify-center p-6 bg-white"><Text className="text-destructive">Offre introuvable.</Text></View>
  }

  const dateStr = new Date(offer.shipDepartureDate).toLocaleDateString('fr', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <View className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: '#0d9488' }}>
        <View className="p-5">
          <Text className="text-white text-2xl font-extrabold">
            {offer.departurePort} → {offer.destinationPort}
          </Text>
          <Text className="text-white/90 text-sm mt-2">
            Départ bateau le <Text className="font-bold text-white">{dateStr}</Text>
          </Text>
        </View>
      </View>

      <View className="bg-white border border-border rounded-2xl p-4 mb-4">
        <Row label="Livres disponibles" value={`${offer.availableLbs.toLocaleString()} lbs`} />
        <Row label="Prix par livre" value={`${offer.pricePerLb.toLocaleString()}`} />
        <Row label="Statut" value={offer.status} />
      </View>

      {offer.notes && (
        <View className="bg-white border border-border rounded-2xl p-4 mb-4">
          <Text className="text-xs uppercase text-muted-foreground mb-1">Notes de l&apos;expéditeur</Text>
          <Text className="text-sm text-dark leading-relaxed">{offer.notes}</Text>
        </View>
      )}

      <CreatorCard
        firstName={offer.creatorFirstName}
        isCertified={offer.creatorIsCertified}
        rating={offer.creatorRating}
        reviewCount={offer.creatorReviewCount}
        phone={offer.creatorPhone}
        whatsApp={offer.creatorWhatsApp}
        isAuthenticated={isAuthenticated}
      />
    </ScrollView>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-border last:border-0">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-semibold text-dark">{value}</Text>
    </View>
  )
}
