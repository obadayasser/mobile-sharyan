import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { adminService } from '@/services/admin.service';
import { Donor } from '@/types/donor';
import { getBloodTypeLabel } from '@/utils/blood-type';
import { Colors } from '@/constants/theme';

export default function AdminDonors() {
  const { t } = useTranslation();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listDonors(1, 50).then((res) => setDonors(res.data)).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string) => {
    try {
      await adminService.toggleDonorActive(id);
      setDonors((prev) => prev.map((d) => d.id === id ? { ...d, isActive: !d.isActive } : d));
    } catch { }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('admin.manageDonors')} showBack />
      <FlatList
        data={donors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-4 pb-10 pt-3`}
        renderItem={({ item }) => (
          <Card style={tw`mb-3`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-1`}>
                <Text style={tw`font-bold text-gray-900`}>{item.name}</Text>
                <Text style={tw`text-sm text-gray-500`}>{getBloodTypeLabel(item.bloodType)} - {item.mobile || ''}</Text>
              </View>
              <Pressable onPress={() => toggleActive(item.id)}>
                <Badge label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? Colors.success : Colors.error} variant="filled" size="sm" />
              </Pressable>
            </View>
          </Card>
        )}
      />
    </View>
  );
}
