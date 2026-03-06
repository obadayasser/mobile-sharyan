import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import { BloodType, BLOOD_TYPES } from '@/constants/enums';
import { BloodTypeChip } from '@/components/blood/BloodTypeChip';

interface BloodTypePickerProps {
  selected: BloodType | null;
  onSelect: (bloodType: BloodType) => void;
}

export function BloodTypePicker({ selected, onSelect }: BloodTypePickerProps) {
  return (
    <View style={tw`flex-row flex-wrap gap-2`}>
      {BLOOD_TYPES.map((type) => (
        <BloodTypeChip
          key={type}
          bloodType={type}
          selected={selected === type}
          onPress={() => onSelect(type)}
        />
      ))}
    </View>
  );
}
