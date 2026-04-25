import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Colors } from '@/constants/theme';

const TAG = '[push]';

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PushTokenResult {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
}

let handlerInstalled = false;
let androidChannelInstalled = false;

// Set the foreground notification handler so notifications show even when the
// app is open. Idempotent.
export function setupNotificationHandler() {
  if (handlerInstalled) return;
  handlerInstalled = true;
  console.log(`${TAG} installing foreground handler`);
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      // SDK 51+ split fields:
      shouldShowBanner: true,
      shouldShowList: true,
    } as any),
  });
}

// Create the Android default channel (required for Android 8+). Idempotent.
export async function setupAndroidChannel() {
  if (Platform.OS !== 'android' || androidChannelInstalled) return;
  androidChannelInstalled = true;
  try {
    console.log(`${TAG} creating android channels`);
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colors.primary,
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('blood-requests', {
      name: 'Urgent Blood Requests',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: Colors.primary,
      sound: 'default',
      bypassDnd: true,
    });
    console.log(`${TAG} channels created`);
  } catch (err: any) {
    console.warn(`${TAG} failed to create android channel`, err?.message ?? err);
  }
}

// Ask the user (if needed) and return the permission status.
export async function ensureNotificationPermission(): Promise<PushPermissionStatus> {
  if (!Device.isDevice) {
    console.warn(`${TAG} not a physical device — push notifications are unavailable on simulators/web`);
    return 'denied';
  }
  const existing = await Notifications.getPermissionsAsync();
  console.log(`${TAG} existing permission`, existing);
  if (existing.status === 'granted') return 'granted';
  if (!existing.canAskAgain) {
    console.warn(`${TAG} permission already denied and cannot ask again`);
    return existing.status as PushPermissionStatus;
  }
  console.log(`${TAG} requesting permission...`);
  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  console.log(`${TAG} permission result`, requested);
  return requested.status as PushPermissionStatus;
}

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId
  );
}

// Try the Expo push token first (works in dev with Expo Go and managed
// builds), then fall back to the raw FCM/APNs device token. Either is
// acceptable to send to the backend's `fcmToken` field — the backend should
// detect the format and route accordingly.
export async function getPushToken(): Promise<PushTokenResult | null> {
  if (!Device.isDevice) return null;

  const projectId = getProjectId();
  if (projectId) {
    try {
      console.log(`${TAG} fetching expo push token (projectId=${projectId})`);
      const result = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log(`${TAG} expo push token`, result.data);
      return { token: result.data, type: 'expo' };
    } catch (err: any) {
      console.warn(`${TAG} expo push token failed`, err?.message ?? err);
    }
  } else {
    console.warn(
      `${TAG} no projectId in app config (expo.extra.eas.projectId) — skipping Expo token, will try device token`
    );
  }

  try {
    console.log(`${TAG} fetching device push token`);
    const result = await Notifications.getDevicePushTokenAsync();
    console.log(`${TAG} device push token`, result);
    const type = (result.type === 'ios' ? 'apns' : 'fcm') as 'fcm' | 'apns';
    return { token: String(result.data), type };
  } catch (err: any) {
    console.warn(`${TAG} device push token failed`, err?.message ?? err);
    return null;
  }
}

export async function registerForPushNotifications(): Promise<PushTokenResult | null> {
  setupNotificationHandler();
  await setupAndroidChannel();
  const status = await ensureNotificationPermission();
  if (status !== 'granted') {
    console.warn(`${TAG} permission not granted (${status}) — skipping token fetch`);
    return null;
  }
  return getPushToken();
}
