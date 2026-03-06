import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    // Replace YOUR_SERVER_IP with your actual server IP
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:3000/api/v1'
      : 'http://localhost:3000/api/v1';
  }
  return 'http://YOUR_SERVER_IP:3000/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const SOCKET_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000'
  : 'http://YOUR_SERVER_IP:3000';
