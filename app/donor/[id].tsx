import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { BloodTypeChip } from '@/components/blood/BloodTypeChip';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { gamificationService } from '@/services/gamification.service';
import { GamificationSummary } from '@/types/gamification';
import { Colors } from '@/constants/theme';

export default function DonorProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationService.getDonorSummary(id!).then(setSummary).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('donor.title')} showBack />
      <ScrollView contentContainerStyle={tw`px-5 pb-10 pt-4 items-center`}>
        <Avatar name="D" size={80} />
        {summary && (
          <>
            <View style={tw`flex-row items-center gap-4 mt-4`}>
              <Card style={tw`flex-1 items-center`}>
                <Text style={[tw`text-2xl font-bold`, { color: Colors.primary }]}>{summary.points}</Text>
                <Text style={tw`text-xs text-gray-500`}>{t('common.points')}</Text>
              </Card>
              <Card style={tw`flex-1 items-center`}>
                <Text style={tw`text-2xl font-bold text-gray-900`}>{summary.totalDonations}</Text>
                <Text style={tw`text-xs text-gray-500`}>{t('donor.totalDonations')}</Text>
              </Card>
            </View>
            {summary.badges.length > 0 && (
              <View style={tw`w-full mt-6`}>
                <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>{t('gamification.badges')}</Text>
                <View style={tw`flex-row flex-wrap gap-3`}>
                  {summary.badges.map((b) => (
                    <BadgeCard key={b.badge} badge={b.badge} earned earnedAt={b.earnedAt} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
