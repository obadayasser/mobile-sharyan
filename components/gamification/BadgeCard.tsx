import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { MotiView } from 'moti';
import { MaterialIcons } from '@expo/vector-icons';
import { BadgeType } from '@/constants/enums';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/date';

interface BadgeCardProps {
  badge: BadgeType;
  earned: boolean;
  earnedAt?: string;
}

export function BadgeCard({ badge, earned, earnedAt }: BadgeCardProps) {
  const { t } = useTranslation();

  return (
    <MotiView
      from={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'timing', duration: 500 }}
    >
      <View
        style={[
          tw`items-center p-4 rounded-2xl`,
          { backgroundColor: earned ? Colors.surface : Colors.borderLight, opacity: earned ? 1 : 0.5 },
        ]}
      >
        <MaterialIcons
          name={earned ? 'emoji-events' : 'emoji-events'}
          size={40}
          color={earned ? Colors.warning : Colors.textLight}
        />
        <Text
          style={[
            tw`text-sm font-bold mt-2 text-center`,
            { color: earned ? Colors.text : Colors.textLight },
          ]}
        >
          {t(`badges.${badge}`)}
        </Text>
        {earned && earnedAt && (
          <Text style={[tw`text-xs mt-1`, { color: Colors.textSecondary }]}>
            {formatDate(earnedAt)}
          </Text>
        )}
      </View>
    </MotiView>
  );
}
