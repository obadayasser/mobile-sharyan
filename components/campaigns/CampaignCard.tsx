import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Campaign } from '@/types/campaign';
import { Colors } from '@/constants/theme';
import { formatDate } from '@/utils/date';
import i18n from '@/i18n';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: () => void;
}

const statusColorMap: Record<string, 'success' | 'warning' | 'error' | 'primary'> = {
  UPCOMING: 'primary',
  ACTIVE: 'success',
  COMPLETED: 'warning',
  CANCELLED: 'error',
};

export default function CampaignCard({ campaign, onPress }: CampaignCardProps) {
  const { t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const displayTitle = isArabic && campaign.titleAr ? campaign.titleAr : campaign.title;

  return (
    <Card onPress={onPress}>
      <View style={tw`flex-row items-start justify-between mb-2`}>
        <Text style={[tw`text-base font-bold flex-1 mr-2`, { color: Colors.text }]}>
          {displayTitle}
        </Text>
        <Badge
          label={campaign.status}
          color={statusColorMap[campaign.status] || 'primary'}
          variant="filled"
          size="sm"
        />
      </View>

      {/* Date range */}
      <Text style={[tw`text-sm mb-2`, { color: Colors.textSecondary }]}>
        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
      </Text>

      {/* Target / collected bags */}
      <View style={tw`flex-row items-center`}>
        <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
          {t('campaign.bags', {
            collected: campaign.collectedBags,
            target: campaign.targetBags ?? '—',
          })}
        </Text>
      </View>
    </Card>
  );
}
