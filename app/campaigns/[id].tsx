import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { campaignService } from '@/services/campaign.service';
import { Campaign } from '@/types/campaign';
import { useAuth } from '@/store/AuthContext';
import { Colors } from '@/constants/theme';
import { formatDate } from '@/utils/date';
import i18n from '@/i18n';

export default function CampaignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { userType } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    campaignService.getById(id!).then(setCampaign).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    setActionLoading(true);
    try { await campaignService.register(id!); Alert.alert(t('common.done')); } catch (e: any) { Alert.alert(t('common.error'), e?.message); }
    finally { setActionLoading(false); }
  };

  if (loading || !campaign) return <LoadingSpinner />;

  const title = (i18n.language === 'ar' && campaign.titleAr) ? campaign.titleAr : campaign.title;
  const desc = (i18n.language === 'ar' && campaign.descriptionAr) ? campaign.descriptionAr : campaign.description;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('campaign.title')} showBack />
      <ScrollView contentContainerStyle={tw`px-5 pb-10 pt-4`}>
        <Card>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <Text style={tw`text-xl font-bold text-gray-900 flex-1 mr-3`}>{title}</Text>
            <Badge label={campaign.status} color={campaign.status === 'ACTIVE' ? Colors.success : Colors.warning} variant="filled" size="sm" />
          </View>
          <Text style={tw`text-sm text-gray-500 mb-2`}>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</Text>
          {campaign.address && <Text style={tw`text-sm text-gray-500 mb-2`}>{campaign.address}</Text>}
          {desc && <Text style={tw`text-sm text-gray-700 mt-2`}>{desc}</Text>}
          {campaign.targetBags && (
            <Text style={tw`text-sm text-gray-500 mt-3`}>{t('campaign.targetBags', { count: campaign.targetBags })}</Text>
          )}
        </Card>
        {userType === 'DONOR' && campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED' && (
          <View style={tw`mt-4`}>
            <Button title={t('campaign.register')} onPress={handleRegister} loading={actionLoading} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
