import { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { bloodBankService } from '@/services/blood-bank.service';
import { BloodBank } from '@/types/blood-bank';
import { Colors } from '@/constants/theme';

export default function AdminBloodBanks() {
  const { t } = useTranslation();
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bloodBankService.getPending().then(setBanks).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      if (action === 'approve') await bloodBankService.approve(id);
      else if (action === 'reject') await bloodBankService.reject(id);
      else await bloodBankService.suspend(id);
      setBanks((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) { Alert.alert(t('common.error'), e?.message); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('admin.manageBloodBanks')} showBack />
      <FlatList
        data={banks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-4 pb-10 pt-3`}
        renderItem={({ item }) => (
          <Card style={tw`mb-3`}>
            <Text style={tw`font-bold text-gray-900 mb-1`}>{item.name}</Text>
            <Text style={tw`text-sm text-gray-500 mb-1`}>{item.city || ''} - {item.phone || ''}</Text>
            <Badge label={item.status} color={Colors.warning} variant="filled" size="sm" />
            <View style={tw`flex-row gap-2 mt-3`}>
              <View style={tw`flex-1`}><Button title={t('admin.approve')} onPress={() => handleAction(item.id, 'approve')} /></View>
              <View style={tw`flex-1`}><Button title={t('admin.reject')} variant="danger" onPress={() => handleAction(item.id, 'reject')} /></View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}
