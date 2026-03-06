import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 48, color = Colors.primary }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const fontSize = size * 0.4;

  return (
    <View
      style={[
        tw`rounded-full items-center justify-center`,
        { width: size, height: size, backgroundColor: color },
      ]}
    >
      <Text style={[tw`font-bold`, { color: Colors.white, fontSize }]}>{initial}</Text>
    </View>
  );
}
