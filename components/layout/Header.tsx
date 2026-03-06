import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <View
      style={[
        tw`flex-row items-center py-3 px-4 bg-white`,
        { borderBottomWidth: 1, borderBottomColor: Colors.border },
      ]}
    >
      {/* Left: back button or spacer */}
      <View style={tw`w-10`}>
        {showBack && (
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
        )}
      </View>

      {/* Center: title */}
      <Text
        style={[tw`flex-1 text-lg font-bold text-center`, { color: Colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Right: action or spacer */}
      <View style={tw`w-10 items-end`}>{rightAction}</View>
    </View>
  );
}
