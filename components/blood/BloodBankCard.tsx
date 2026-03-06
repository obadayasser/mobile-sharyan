import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { BloodBank } from '@/types/blood-bank';
import { Colors } from '@/constants/theme';

interface BloodBankCardProps {
  bloodBank: BloodBank;
  onPress: () => void;
}

const statusColorMap: Record<string, 'success' | 'warning' | 'error' | 'primary'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
  SUSPENDED: 'error',
};

export default function BloodBankCard({ bloodBank, onPress }: BloodBankCardProps) {
  return (
    <Card onPress={onPress}>
      <View style={tw`flex-row items-start justify-between mb-2`}>
        <Text style={[tw`text-base font-bold flex-1`, { color: Colors.text }]}>
          {bloodBank.name}
        </Text>
        <Badge
          label={bloodBank.status}
          color={statusColorMap[bloodBank.status] || 'primary'}
          variant="filled"
          size="sm"
        />
      </View>

      {bloodBank.city && (
        <View style={tw`flex-row items-center mb-1`}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={[tw`text-sm ml-1`, { color: Colors.textSecondary }]}>{bloodBank.city}</Text>
        </View>
      )}

      {bloodBank.phone && (
        <View style={tw`flex-row items-center`}>
          <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
          <Text style={[tw`text-sm ml-1`, { color: Colors.textSecondary }]}>{bloodBank.phone}</Text>
        </View>
      )}
    </Card>
  );
}
