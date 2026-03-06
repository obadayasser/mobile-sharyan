import { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { LeaderboardRow } from '@/components/gamification/LeaderboardRow';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { gamificationService } from '@/services/gamification.service';
import { useAuth } from '@/store/AuthContext';
import { LeaderboardEntry } from '@/types/gamification';

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationService.getLeaderboard(1, 50).then((res) => setEntries(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('gamification.leaderboard')} showBack />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`pb-10`}
        renderItem={({ item, index }) => (
          <LeaderboardRow entry={item} rank={index + 1} isCurrentUser={item.id === (profile as any)?.id} />
        )}
        ListEmptyComponent={<EmptyState icon="leaderboard" title={t('common.noData')} />}
      />
    </View>
  );
}
