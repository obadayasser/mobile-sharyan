import { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { donorService } from '@/services/donor.service';
import { useAuth } from '@/store/AuthContext';
import { Colors } from '@/constants/theme';
import { Donor } from '@/types/donor';
import { timeAgo } from '@/utils/date';

export default function PointsScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const donor = profile as Donor;
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donorService.getMyPoints(1, 50).then((res) => setTransactions(res.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('gamification.points')} showBack />
      <View style={tw`bg-white px-5 py-6 items-center border-b border-gray-100`}>
        <Text style={[tw`text-4xl font-bold`, { color: Colors.primary }]}>{donor?.points || 0}</Text>
        <Text style={tw`text-sm text-gray-500 mt-1`}>{t('gamification.totalPoints')}</Text>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-4 pb-10 pt-3`}
        renderItem={({ item }) => (
          <Card style={tw`mb-2`}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={tw`text-sm text-gray-700`}>{item.reason}</Text>
              <Text style={[tw`font-bold`, { color: Colors.primary }]}>+{item.points}</Text>
            </View>
            <Text style={tw`text-xs text-gray-400 mt-1`}>{timeAgo(item.createdAt)}</Text>
          </Card>
        )}
      />
    </View>
  );
}
