import * as SecureStore from 'expo-secure-store'
import type { UserDto } from '@/src/types/api'

// Wrapper autour de expo-secure-store — équivalent mobile sécurisé de localStorage
// (chiffré par le Keychain iOS / EncryptedSharedPreferences Android).

const TOKEN_KEY = 'sp_token'
const USER_KEY = 'sp_user'

export async function saveAuth(token: string, user: UserDto): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function getUser(): Promise<UserDto | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserDto
  } catch {
    return null
  }
}

export async function clearAuth(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(USER_KEY)
}
