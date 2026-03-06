import { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { BloodRequestCard } from '@/components/blood/BloodRequestCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { adminService } from '@/services/admin.service';
import { BloodRequest } from '@/types/blood-request';

export default function AdminBloodRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listBloodRequests(1, 50).then((res) => setRequests(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('admin.manageRequests')} showBack />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-4 pb-10 pt-3`}
        renderItem={({ item }) => (
          <View style={tw`mb-3`}><BloodRequestCard request={item} onPress={() => router.push(`/blood-request/${item.id}`)} /></View>
        )}
      />
    </View>
  );
}
