import '@/i18n';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/store/AuthContext';
import { SocketProvider } from '@/store/SocketContext';
import { NotificationProvider } from '@/store/NotificationContext';
import i18n from '@/i18n';

SplashScreen.preventAutoHideAsync();

// Force RTL for Arabic
if (i18n.language === 'ar' && !I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
} else if (i18n.language !== 'ar' && I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
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
  );
}
