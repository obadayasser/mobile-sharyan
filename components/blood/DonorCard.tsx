import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { BloodTypeChip } from '@/components/blood/BloodTypeChip';
import { DonorSearchResult } from '@/types/donor';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface DonorCardProps {
  donor: DonorSearchResult;
  onPress: () => void;
}

export function DonorCard({ donor, onPress }: DonorCardProps) {
  const { t } = useTranslation();

  return (
    <Card onPress={onPress}>
      <View style={tw`flex-row items-center`}>
        {/* Avatar */}
        <Avatar name={donor.name} size={48} />

        {/* Info */}
        <View style={tw`flex-1 ml-3`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={[tw`text-base font-bold`, { color: Colors.text }]}>{donor.name}</Text>
            <BloodTypeChip bloodType={donor.bloodType} selected />
          </View>

          <View style={tw`flex-row items-center mt-1`}>
            {/* Availability dot */}
            <View
              style={[
                tw`w-2.5 h-2.5 rounded-full mr-2`,
                { backgroundColor: donor.isAvailable ? Colors.success : Colors.error },
              ]}
            />
            <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
              {donor.isAvailable ? t('donor.available') : t('donor.unavailable')}
            </Text>

            {/* Distance */}
            {donor.distanceKm !== undefined && (
              <Text style={[tw`text-sm ml-3`, { color: Colors.textSecondary }]}>
                {donor.distanceKm.toFixed(1)} {t('common.km')}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}
