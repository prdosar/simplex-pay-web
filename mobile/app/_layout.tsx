import '@/global.css'

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'

import { useColorScheme } from '@/components/useColorScheme'
import { AuthProvider } from '@/src/context/AuthContext'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => { SplashScreen.hideAsync() }, [])
  return <RootLayoutNav />
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="auth/verify" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="offers/[id]" options={{ title: 'Offre' }} />
          <Stack.Screen name="kilos/[id]" options={{ title: 'Kilos voyage' }} />
          <Stack.Screen name="fret/[id]" options={{ title: 'Fret bateau' }} />
          <Stack.Screen name="create" options={{ title: 'Nouvelle offre' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  )
}
