import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({
  size = 'large',
  color = Colors.primary,
}: LoadingSpinnerProps) {
  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
