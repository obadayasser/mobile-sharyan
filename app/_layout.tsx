import '@/setup-logs';
import '@/i18n';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/store/AuthContext';
import { SocketProvider } from '@/store/SocketContext';
import { NotificationProvider } from '@/store/NotificationContext';
import { hydrateLanguage } from '@/i18n';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateLanguage()
      .finally(() => setReady(true))
      .finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="blood-request/[id]" />
              <Stack.Screen name="blood-request/create" options={{ presentation: 'modal' }} />
              <Stack.Screen name="blood-bank/[id]" />
              <Stack.Screen name="donor/[id]" />
              <Stack.Screen name="chat" />
              <Stack.Screen name="campaigns" />
              <Stack.Screen name="gamification" />
              <Stack.Screen name="admin" />
              <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
              <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
            </Stack>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
