import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { notificationService } from '@/services/notification.service';
import { donorService } from '@/services/donor.service';
import { patientService } from '@/services/patient.service';
import { bloodBankService } from '@/services/blood-bank.service';
import {
  registerForPushNotifications,
  setupNotificationHandler,
  setupAndroidChannel,
} from '@/services/push-notifications';

const TAG = '[notif-ctx]';

interface NotificationState {
  unreadCount: number;
  pushToken: string | null;
  refreshCount: () => Promise<void>;
  decrementCount: () => void;
  resetCount: () => void;
}

const NotificationContext = createContext<NotificationState>({
  unreadCount: 0,
  pushToken: null,
  refreshCount: async () => {},
  decrementCount: () => {},
  resetCount: () => {},
});

// Install foreground handler + android channel as soon as this module loads,
// so taps on notifications can route us into the app even before the auth
// state is hydrated. Idempotent.
setupNotificationHandler();
setupAndroidChannel();

async function uploadFcmToken(userType: string, token: string) {
  console.log(`${TAG} uploading fcm token for`, userType);
  try {
    if (userType === 'DONOR') await donorService.updateFcmToken(token);
    else if (userType === 'PATIENT') await patientService.updateFcmToken(token);
    else if (userType === 'BLOOD_BANK') await bloodBankService.updateFcmToken(token);
    console.log(`${TAG} fcm token upload OK`);
  } catch (err: any) {
    console.warn(`${TAG} fcm token upload FAILED`, err?.message ?? err);
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isOnboarded, userType } = useAuth();
  const { notificationSocket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const lastUploadedToken = useRef<string | null>(null);

  const refreshCount = useCallback(async () => {
    if (!isOnboarded || !userType || userType === 'ADMIN') return;
    try {
      const result = await notificationService.getUnreadCount(userType);
      console.log(`${TAG} unread-count`, result);
      setUnreadCount(result.count);
    } catch (err: any) {
      console.warn(`${TAG} unread-count failed`, err?.message ?? err);
    }
  }, [isOnboarded, userType]);

  useEffect(() => {
    if (isOnboarded) refreshCount();
  }, [isOnboarded, refreshCount]);

  // Register for push & upload the token whenever the user becomes onboarded
  // or switches role.
  useEffect(() => {
    if (!isOnboarded || !userType || userType === 'ADMIN') {
      console.log(`${TAG} push reg skipped (not onboarded)`);
      return;
    }
    let cancelled = false;
    (async () => {
      console.log(`${TAG} registering push for`, userType);
      const result = await registerForPushNotifications();
      if (cancelled) return;
      if (!result) {
        console.warn(`${TAG} no push token obtained — notifications will not be delivered to this device`);
        return;
      }
      console.log(`${TAG} got push token (${result.type}):`, result.token);
      setPushToken(result.token);
      if (lastUploadedToken.current !== result.token) {
        await uploadFcmToken(userType, result.token);
        lastUploadedToken.current = result.token;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOnboarded, userType]);

  // Refresh unread count on a foreground push arrival.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      console.log(`${TAG} foreground notification received`, notification.request.content.title);
      setUnreadCount((c) => c + 1);
    });
    return () => sub.remove();
  }, []);

  // Log notification taps (useful for diagnosing routing issues).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(`${TAG} notification tapped`, response.notification.request.content);
    });
    return () => sub.remove();
  }, []);

  // Existing socket-based unread bump.
  useEffect(() => {
    if (!notificationSocket) return;
    const handler = (payload?: any) => {
      console.log(`${TAG} socket -> notification`, payload);
      setUnreadCount((c) => c + 1);
    };
    notificationSocket.on('notification', handler);
    return () => {
      notificationSocket.off('notification', handler);
    };
  }, [notificationSocket]);

  const decrementCount = useCallback(() => {
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const resetCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, pushToken, refreshCount, decrementCount, resetCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationCount() {
  return useContext(NotificationContext);
}
