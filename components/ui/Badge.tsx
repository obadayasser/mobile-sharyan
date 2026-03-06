import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';

type BadgeColor = 'primary' | 'success' | 'warning' | 'error';
type BadgeVariant = 'filled' | 'outlined';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const colorMap: Record<BadgeColor, string> = {
  primary: Colors.primary,
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
};

export default function Badge({
  label,
  color = 'primary',
  variant = 'filled',
  size = 'md',
}: BadgeProps) {
  const bgColor = colorMap[color];
  const isFilled = variant === 'filled';
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        tw`rounded-full self-start`,
        isSmall ? tw`px-2 py-0.5` : tw`px-3 py-1`,
        isFilled
          ? { backgroundColor: bgColor }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: bgColor },
      ]}
    >
      <Text
        style={[
          isSmall ? tw`text-xs` : tw`text-sm`,
          tw`font-medium`,
          { color: isFilled ? Colors.white : bgColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
