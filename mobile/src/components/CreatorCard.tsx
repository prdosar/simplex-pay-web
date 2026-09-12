import { View, Text, Pressable, Linking } from 'react-native'

interface Props {
  firstName: string
  isCertified: boolean
  rating: number
  reviewCount: number
  phone?: string
  whatsApp?: string
  isAuthenticated: boolean
}

/** Bloc "vendeur" avec pastille certifié, note, et boutons contact (tel/WhatsApp).
 *  Gate le contact derrière l'auth. */
export default function CreatorCard(p: Props) {
  return (
    <View className="bg-white border border-border rounded-2xl p-4 mb-4">
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
          <Text className="text-white text-lg font-extrabold">{p.firstName[0]}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-dark">{p.firstName}</Text>
            {p.isCertified && (
              <View className="px-2 py-0.5 rounded-full bg-primary-light">
                <Text className="text-[10px] font-bold" style={{ color: '#0f766e' }}>✓ Certifié</Text>
              </View>
            )}
          </View>
          {p.reviewCount > 0 ? (
            <Text className="text-xs text-muted-foreground mt-0.5">
              ★ {p.rating.toFixed(1)} ({p.reviewCount} avis)
            </Text>
          ) : (
            <Text className="text-xs italic text-muted-foreground mt-0.5">Aucun avis</Text>
          )}
        </View>
      </View>

      {p.isAuthenticated ? (
        <View className="gap-2">
          {p.phone && (
            <Pressable
              onPress={() => Linking.openURL(`tel:${p.phone}`)}
              className="flex-row items-center gap-2 py-2.5 px-3 rounded-xl bg-muted"
            >
              <Text className="text-lg">📞</Text>
              <Text className="text-sm font-semibold text-dark flex-1">{p.phone}</Text>
              <Text className="text-xs text-primary font-bold">Appeler</Text>
            </Pressable>
          )}
          {p.whatsApp && (
            <Pressable
              onPress={() => Linking.openURL(`https://wa.me/${p.whatsApp!.replace(/\D/g, '')}`)}
              className="flex-row items-center gap-2 py-2.5 px-3 rounded-xl bg-muted"
            >
              <Text className="text-lg">💬</Text>
              <Text className="text-sm font-semibold text-dark flex-1">WhatsApp</Text>
              <Text className="text-xs text-primary font-bold">Message</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Text className="text-sm text-muted-foreground text-center italic">
          🔒 Connecte-toi pour voir le contact
        </Text>
      )}
    </View>
  )
}
