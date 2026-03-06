import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { BloodTypeChip } from '@/components/blood/BloodTypeChip';
import { UrgencyIndicator } from '@/components/blood/UrgencyIndicator';
import { BloodRequest } from '@/types/blood-request';
import { Colors } from '@/constants/theme';
import { timeAgo } from '@/utils/date';

interface BloodRequestCardProps {
  request: BloodRequest;
  onPress: () => void;
}

export function BloodRequestCard({ request, onPress }: BloodRequestCardProps) {
  const { t } = useTranslation();
  const progressPercent =
    request.bagsNeeded > 0
      ? Math.min((request.bagsFulfilled / request.bagsNeeded) * 100, 100)
      : 0;

  return (
    <Card onPress={onPress}>
      {/* Top row: blood type + urgency */}
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <BloodTypeChip bloodType={request.bloodType} selected />
        <UrgencyIndicator urgency={request.urgency} />
      </View>

      {/* Patient name */}
      <Text style={[tw`text-base font-bold mb-1`, { color: Colors.text }]}>
        {request.patientName}
      </Text>

      {/* Hospital */}
      {request.hospitalName && (
        <View style={tw`flex-row items-center mb-3`}>
          <Ionicons name="business-outline" size={14} color={Colors.textSecondary} />
          <Text style={[tw`text-sm ml-1`, { color: Colors.textSecondary }]}>
            {request.hospitalName}
          </Text>
        </View>
      )}

      {/* Bags progress */}
      <View style={tw`mb-2`}>
        <Text style={[tw`text-sm mb-1`, { color: Colors.textSecondary }]}>
          {t('bloodRequest.bagsProgress', {
            fulfilled: request.bagsFulfilled,
            needed: request.bagsNeeded,
          })}
        </Text>
        <View style={[tw`h-2 rounded-full`, { backgroundColor: Colors.borderLight }]}>
          <View
            style={[
              tw`h-2 rounded-full bg-red-600`,
              { width: `${progressPercent}%` as any },
            ]}
          />
        </View>
      </View>

      {/* Time ago */}
      <View style={tw`flex-row justify-end`}>
        <Text style={[tw`text-xs`, { color: Colors.textLight }]}>
          {timeAgo(request.createdAt)}
        </Text>
      </View>
    </Card>
  );
}
