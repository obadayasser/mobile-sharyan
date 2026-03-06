import { Platform } from 'react-native';

// ============================================================
// SET YOUR SERVER IP HERE
// - Android emulator: use 10.0.2.2
// - iOS simulator: use localhost
// - Physical device (Android/iOS): use your PC's LAN IP
//   (run `ipconfig` on Windows or `ifconfig` on Mac to find it)
// ============================================================
const SERVER_IP = '192.168.1.13';
const SERVER_PORT = '3000';

// Set to true if testing on a physical device via Expo Go / dev build
const USE_PHYSICAL_DEVICE = true;

const getBaseUrl = () => {
  if (__DEV__) {
    if (USE_PHYSICAL_DEVICE) {
      // Physical device needs LAN IP
      return `http://${SERVER_IP}:${SERVER_PORT}/api/v1`;
    }
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${SERVER_PORT}/api/v1`;
    }
    return `http://localhost:${SERVER_PORT}/api/v1`;
  }
  return `http://${SERVER_IP}:${SERVER_PORT}/api/v1`;
};

export const API_BASE_URL = getBaseUrl();

export const SOCKET_URL = __DEV__
  ? USE_PHYSICAL_DEVICE
    ? `http://${SERVER_IP}:${SERVER_PORT}`
    : Platform.OS === 'android'
      ? `http://10.0.2.2:${SERVER_PORT}`
      : `http://localhost:${SERVER_PORT}`
  : `http://${SERVER_IP}:${SERVER_PORT}`;
  