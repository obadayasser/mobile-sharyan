import React from 'react';
import { Pressable, Text } from 'react-native';
import tw from 'twrnc';
import { BloodType } from '@/constants/enums';
import { getBloodTypeLabel } from '@/utils/blood-type';
import { Colors } from '@/constants/theme';

interface BloodTypeChipProps {
  bloodType: BloodType;
  selected?: boolean;
  onPress?: () => void;
  label?: string;
}

export function BloodTypeChip({
  bloodType,
  selected = false,
  onPress,
  label,
}: BloodTypeChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        tw`rounded-full px-4 py-2 min-w-12 items-center justify-center`,
        selected
          ? { backgroundColor: Colors.primary }
          : { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
        pressed && onPress && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          tw`text-sm font-bold text-center`,
          { color: selected ? Colors.white : Colors.primary },
        ]}
      >
        {label || getBloodTypeLabel(bloodType)}
      </Text>
    </Pressable>
  );
}
