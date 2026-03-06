import React from 'react';
import { Pressable, Text } from 'react-native';
import tw from 'twrnc';
import { BloodType } from '@/constants/enums';
import { getBloodTypeLabel } from '@/utils/blood-type';

interface BloodTypeChipProps {
  bloodType: BloodType;
  selected?: boolean;
  onPress?: () => void;
}

export default function BloodTypeChip({
  bloodType,
  selected = false,
  onPress,
}: BloodTypeChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        tw`rounded-full px-3 py-1`,
        selected
          ? tw`bg-red-600`
          : [tw`bg-white border border-red-600`],
        pressed && onPress && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          tw`text-sm font-bold text-center`,
          selected ? tw`text-white` : tw`text-red-600`,
        ]}
      >
        {getBloodTypeLabel(bloodType)}
      </Text>
    </Pressable>
  );
}
