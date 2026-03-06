import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { BloodType, StockLevel } from '@/constants/enums';
import { getBloodTypeLabel } from '@/utils/blood-type';
import { Colors } from '@/constants/theme';

interface StockLevelBarProps {
  bloodType: BloodType;
  stockLevel: StockLevel;
  bagsCount: number;
}

const stockColorMap: Record<StockLevel, string> = {
  CRITICAL: Colors.error,
  LOW: Colors.warning,
  ADEQUATE: Colors.success,
  HIGH: '#3B82F6',
};

const stockMaxMap: Record<StockLevel, number> = {
  CRITICAL: 25,
  LOW: 50,
  ADEQUATE: 75,
  HIGH: 100,
};

export function StockLevelBar({ bloodType, stockLevel, bagsCount }: StockLevelBarProps) {
  const color = stockColorMap[stockLevel];
  const fillPercent = stockMaxMap[stockLevel];

  return (
    <View style={tw`mb-3`}>
      <View style={tw`flex-row items-center justify-between mb-1`}>
        <Text style={[tw`text-sm font-bold`, { color: Colors.text }]}>
          {getBloodTypeLabel(bloodType)}
        </Text>
        <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>{bagsCount}</Text>
      </View>
      <View style={[tw`w-full rounded-full`, { height: 8, backgroundColor: Colors.borderLight }]}>
        <View
          style={[
            tw`rounded-full`,
            { height: 8, width: `${fillPercent}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}
