import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import tw from 'twrnc';
import { MotiView } from 'moti';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
    >
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          tw`bg-white rounded-2xl shadow-sm p-4`,
          pressed && onPress && { opacity: 0.9 },
          style,
        ]}
      >
        {children}
      </Pressable>
    </MotiView>
  );
}
