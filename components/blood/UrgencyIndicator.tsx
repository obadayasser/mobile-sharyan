import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { MotiView } from 'moti';
import { BloodRequestUrgency } from '@/constants/enums';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface UrgencyIndicatorProps {
  urgency: BloodRequestUrgency;
}

const urgencyConfig: Record<BloodRequestUrgency, { bg: string; text: string; label: string }> = {
  NORMAL: { bg: '#D1FAE5', text: Colors.normal, label: 'urgency.normal' },
  URGENT: { bg: '#FEF3C7', text: Colors.warning, label: 'urgency.urgent' },
  EMERGENCY: { bg: '#FEE2E2', text: Colors.primary, label: 'urgency.emergency' },
};

export default function UrgencyIndicator({ urgency }: UrgencyIndicatorProps) {
  const { t } = useTranslation();
  const config = urgencyConfig[urgency];

  const content = (
    <View style={[tw`rounded-full px-3 py-1`, { backgroundColor: config.bg }]}>
      <Text style={[tw`text-xs font-bold`, { color: config.text }]}>{t(config.label)}</Text>
    </View>
  );

  if (urgency === 'EMERGENCY') {
    return (
      <MotiView
        from={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 800,
          loop: true,
        }}
      >
        {content}
      </MotiView>
    );
  }

  return content;
}
