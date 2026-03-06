import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { LeaderboardEntry } from '@/types/gamification';
import BloodTypeChip from '@/components/blood/BloodTypeChip';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}

const rankColors: Record<number, string> = {
  1: '#FFD700', // gold
  2: '#C0C0C0', // silver
  3: '#CD7F32', // bronze
};

export default function LeaderboardRow({ entry, rank, isCurrentUser }: LeaderboardRowProps) {
  const { t } = useTranslation();
  const rankColor = rankColors[rank];

  return (
    <View
      style={[
        tw`flex-row items-center px-4 py-3 rounded-xl mb-2`,
        {
          backgroundColor: isCurrentUser ? Colors.primaryLight : Colors.surface,
          borderWidth: isCurrentUser ? 1 : 0,
          borderColor: isCurrentUser ? Colors.primary : 'transparent',
        },
      ]}
    >
      {/* Rank */}
      <View style={tw`w-8 items-center`}>
        <Text
          style={[
            tw`text-lg font-bold`,
            { color: rankColor || Colors.textSecondary },
          ]}
        >
          {rank}
        </Text>
      </View>

      {/* Name + blood type */}
      <View style={tw`flex-1 ml-3`}>
        <Text style={[tw`text-base font-bold`, { color: Colors.text }]}>{entry.name}</Text>
        <View style={tw`flex-row items-center mt-1`}>
          <BloodTypeChip bloodType={entry.bloodType} />
          <Text style={[tw`text-xs ml-2`, { color: Colors.textSecondary }]}>
            {entry.totalDonations} {t('gamification.donations')}
          </Text>
        </View>
      </View>

      {/* Points */}
      <Text style={[tw`text-base font-bold`, { color: Colors.primary }]}>{entry.points}</Text>
    </View>
  );
}
