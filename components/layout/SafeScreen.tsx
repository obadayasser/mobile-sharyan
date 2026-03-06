import React from 'react';
import { ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';

interface SafeScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function SafeScreen({ children, scroll = false, style }: SafeScreenProps) {
  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: Colors.background }, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={tw`flex-grow`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}
