import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { adminService } from '@/services/admin.service';
import { Patient } from '@/types/patient';
import { Colors } from '@/constants/theme';

export default function AdminPatients() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listPatients(1, 50).then((res) => setPatients(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string) => {
    try {
      await adminService.togglePatientActive(id);
      setPatients((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !p.isActive } : p));
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('admin.managePatients')} showBack />
      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-4 pb-10 pt-3`}
        renderItem={({ item }) => (
          <Card style={tw`mb-3`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View><Text style={tw`font-bold text-gray-900`}>{item.name}</Text><Text style={tw`text-sm text-gray-500`}>{item.mobile || ''}</Text></View>
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
