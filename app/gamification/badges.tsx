import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { gamificationService } from '@/services/gamification.service';
import { donorService } from '@/services/donor.service';
import { BadgeDefinition, DonorBadge } from '@/types/gamification';

export default function BadgesScreen() {
  const { t } = useTranslation();
  const [allBadges, setAllBadges] = useState<BadgeDefinition[]>([]);
  const [myBadges, setMyBadges] = useState<DonorBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      gamificationService.getBadges().catch(() => []),
      donorService.getMyBadges().catch(() => []),
    ]).then(([all, mine]) => { setAllBadges(all); setMyBadges(mine); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner />;

  const earnedMap = new Map(myBadges.map((b) => [b.badge, b.earnedAt]));

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('gamification.badges')} showBack />
      <ScrollView contentContainerStyle={tw`px-5 pb-10 pt-4`}>
        <View style={tw`flex-row flex-wrap gap-3`}>
          {allBadges.map((b) => (
            <BadgeCard key={b.badge} badge={b.badge} earned={earnedMap.has(b.badge)} earnedAt={earnedMap.get(b.badge)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
