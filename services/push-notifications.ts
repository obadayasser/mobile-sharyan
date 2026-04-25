import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { Colors } from '@/constants/theme';

const TAG = '[push]';

// Expo Go (the off-the-shelf client) had Android push notifications removed
// in SDK 53. Just IMPORTING `expo-notifications` there triggers a noisy
// runtime error from its auto-registration module. We avoid that by lazy-
// loading `expo-notifications` only when it can actually work.
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const pushSupported = !(isExpoGo && Platform.OS === 'android');

// Lazy require so the offending module is never loaded in Expo Go on Android.
type NotificationsModule = typeof import('expo-notifications');
type DeviceModule = typeof import('expo-device');

let Notifications: NotificationsModule | null = null;
let Device: DeviceModule | null = null;

if (pushSupported) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications') as NotificationsModule;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Device = require('expo-device') as DeviceModule;
}

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PushTokenResult {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
}

let handlerInstalled = false;
let androidChannelInstalled = false;

export function setupNotificationHandler() {
  if (handlerInstalled || !Notifications) return;
  handlerInstalled = true;
  console.log(`${TAG} installing foreground handler`);
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    } as any),
  });
}

export async function setupAndroidChannel() {
  if (Platform.OS !== 'android' || androidChannelInstalled || !Notifications) return;
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

export async function ensureNotificationPermission(): Promise<PushPermissionStatus> {
  if (!Notifications || !Device) return 'denied';
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

export async function getPushToken(): Promise<PushTokenResult | null> {
  if (!Notifications || !Device) return null;
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
  if (!pushSupported) {
    console.log(
      `${TAG} push not supported in current runtime (Expo Go on Android) — skipping registration. Use a development build to receive notifications.`
    );
    return null;
  }
  setupNotificationHandler();
  await setupAndroidChannel();
  const status = await ensureNotificationPermission();
  if (status !== 'granted') {
    console.warn(`${TAG} permission not granted (${status}) — skipping token fetch`);
    return null;
  }
  return getPushToken();
}

// Subscribe to foreground notification arrivals. Returns an unsubscribe fn.
export function addNotificationReceivedListener(
  cb: (n: import('expo-notifications').Notification) => void
): () => void {
  if (!Notifications) return () => {};
  const sub = Notifications.addNotificationReceivedListener(cb);
  return () => sub.remove();
}

// Subscribe to notification taps. Returns an unsubscribe fn.
export function addNotificationResponseListener(
  cb: (r: import('expo-notifications').NotificationResponse) => void
): () => void {
  if (!Notifications) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener(cb);
  return () => sub.remove();
}
