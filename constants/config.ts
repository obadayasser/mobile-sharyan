import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    // Replace 192.168.1.13 with your actual server IP
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:3000/api/v1'
      : 'http://localhost:3000/api/v1';
  }
  return 'http://192.168.1.13:3000/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const SOCKET_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000'
  : 'http://192.168.1.13:3000';
  