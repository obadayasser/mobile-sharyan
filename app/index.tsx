import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/store/AuthContext';
import { Colors } from '@/constants/theme';
import tw from 'twrnc';

export default function Index() {
  const { isLoading, isOnboarded } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isLoading, isOnboarded]);

  return (
    <View style={tw`flex-1 items-center justify-center bg-white`}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
