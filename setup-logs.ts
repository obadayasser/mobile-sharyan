import { LogBox } from 'react-native';

// Library-internal warnings we don't act on. Push-notifications limitations
// in Expo Go are now handled by lazy-requiring expo-notifications, so they
// shouldn't show up at all — these patterns are kept as a safety net.
LogBox.ignoreLogs([
  /SafeAreaView has been deprecated/,
  /expo-notifications.*Expo Go/i,
]);
