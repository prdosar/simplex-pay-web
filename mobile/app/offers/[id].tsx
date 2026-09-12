import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import useSWR from 'swr'
import { api } from '@/src/lib/api'
import { useAuth } from '@/src/context/AuthContext'
import CreatorCard from '@/src/components/CreatorCard'
import type { OfferDto } from '@/src/types/api'

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isAuthenticated } = useAuth()

  const { data: offer, isLoading, error } = useSWR<OfferDto>(
    id ? `/api/offers/${id}` : null,
    (u: string) => api.get<OfferDto>(u)
  )

  if (isLoading) return <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
  if (error || !offer) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-destructive">Offre introuvable.</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <View className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: '#0d9488' }}>
        <View className="p-5">
          <Text className="text-white text-3xl font-extrabold">
            {offer.sellCurrency} → {offer.buyCurrency}
          </Text>
          {offer.rateMode === 'Fixed' && offer.rate !== null ? (
            <Text className="text-white text-2xl font-bold mt-3">
              {offer.rate.toLocaleString()}{' '}
              <Text className="text-base font-normal">{offer.sellCurrencySymbol}/{offer.buyCurrencySymbol}</Text>
            </Text>
          ) : (
            <Text className="text-white/95 text-lg font-semibold mt-3">
              {offer.rateMode === 'GoogleDaily' ? 'Taux Google du jour' : 'Taux XE du jour'}
            </Text>
          )}
        </View>
      </View>

      <View className="bg-white border border-border rounded-2xl p-4 mb-4">
        <Row label="Disponible" value={`${offer.remainingAmount.toLocaleString()} ${offer.sellCurrencySymbol}`} />
        <Row label="Minimum" value={`${offer.minAmount.toLocaleString()} ${offer.sellCurrencySymbol}`} />
        <Row label="Statut" value={offer.status} />
      </View>

      {offer.notes && (
        <View className="bg-white border border-border rounded-2xl p-4 mb-4">
          <Text className="text-xs uppercase text-muted-foreground mb-1">Notes du vendeur</Text>
          <Text className="text-sm text-dark leading-relaxed">{offer.notes}</Text>
        </View>
      )}

      <CreatorCard
        firstName={offer.creator.firstName}
        isCertified={offer.creator.isCertified}
        rating={offer.creator.rating}
        reviewCount={offer.creator.reviewCount}
        phone={offer.creator.phone}
        whatsApp={offer.creator.whatsApp}
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
