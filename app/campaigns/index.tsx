import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { campaignService } from '@/services/campaign.service';
import { Campaign } from '@/types/campaign';
import { CampaignStatus } from '@/constants/enums';
import { Colors } from '@/constants/theme';

const tabs: CampaignStatus[] = ['UPCOMING', 'ACTIVE', 'COMPLETED'];

export default function CampaignsList() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CampaignStatus>('ACTIVE');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    campaignService.list({ status: tab, page: 1, limit: 30 }).then((res) => setCampaigns(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('campaign.title')} showBack />
      <View style={tw`bg-white px-4 py-3 border-b border-gray-100`}>
        <View style={tw`flex-row bg-gray-100 rounded-xl p-1`}>
          {tabs.map((s) => (
            <Pressable key={s} onPress={() => setTab(s)} style={[tw`flex-1 py-2 rounded-lg items-center`, tab === s && tw`bg-white shadow-sm`]}>
              <Text style={[tw`text-sm font-semibold`, { color: tab === s ? Colors.primary : Colors.textSecondary }]}>
                {t(`campaign.${s.toLowerCase()}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {loading ? <LoadingSpinner /> : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-4 pb-10 pt-3`}
          renderItem={({ item }) => (
            <View style={tw`mb-3`}><CampaignCard campaign={item} onPress={() => router.push(`/campaigns/${item.id}`)} /></View>
          )}
          ListEmptyComponent={<EmptyState icon="campaign" title={t('campaign.noCampaigns')} />}
        />
      )}
    </View>
  );
}
