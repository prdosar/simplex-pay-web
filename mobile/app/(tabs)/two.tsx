import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/src/context/AuthContext'

export default function AccountScreen() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-muted-foreground">Chargement…</Text>
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
        <Pressable
          onPress={() => router.push('/auth/login')}
          className="w-full max-w-xs py-3 bg-primary rounded-xl items-center"
        >
          <Text className="text-white font-bold">Se connecter</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white p-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3">
          <Text className="text-white text-2xl font-extrabold">{user?.firstName?.[0]}</Text>
        </View>
        <Text className="text-lg font-bold text-dark">{user?.firstName} {user?.lastName}</Text>
        <Text className="text-sm text-muted-foreground">{user?.email}</Text>
      </View>

      <View className="bg-muted rounded-xl p-4 mb-6">
        <Text className="text-xs uppercase text-muted-foreground mb-1">Pays</Text>
        <Text className="text-base font-semibold">{user?.country}</Text>
      </View>

      <Pressable
        onPress={logout}
        className="py-3 border border-border rounded-xl items-center"
      >
        <Text className="text-destructive font-semibold">Se déconnecter</Text>
      </Pressable>
    </View>
  )
}
