import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={tw`flex-1 items-center justify-center px-8 py-12`}>
      <MaterialIcons name={icon} size={64} color={Colors.textLight} />
      <Text style={[tw`text-lg font-bold mt-4 text-center`, { color: Colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[tw`text-sm mt-2 text-center`, { color: Colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {action && <View style={tw`mt-6`}>{action}</View>}
    </View>
  );
}
