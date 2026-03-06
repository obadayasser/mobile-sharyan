import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/AuthContext';
import { DashboardStats } from '@/types/admin';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { logoutAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/');
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: t('admin.totalDonors'), value: stats?.totalDonors, icon: 'bloodtype', color: Colors.primary },
    { label: t('admin.totalPatients'), value: stats?.totalPatients, icon: 'local-hospital', color: Colors.secondary },
    { label: t('admin.totalBloodBanks'), value: stats?.totalBloodBanks, icon: 'account-balance', color: Colors.success },
    { label: t('admin.totalDonations'), value: stats?.totalDonations, icon: 'volunteer-activism', color: Colors.warning },
    { label: t('admin.openRequests'), value: stats?.openRequests, icon: 'list-alt', color: Colors.error },
    { label: t('admin.pendingBanks'), value: stats?.pendingBloodBanks, icon: 'pending', color: '#8B5CF6' },
  ];

  const menuItems = [
    { label: t('admin.manageDonors'), route: '/admin/donors', icon: 'people' },
    { label: t('admin.managePatients'), route: '/admin/patients', icon: 'personal-injury' },
    { label: t('admin.manageRequests'), route: '/admin/blood-requests', icon: 'list-alt' },
    { label: t('admin.manageBloodBanks'), route: '/admin/blood-banks', icon: 'account-balance' },
  ];

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('admin.dashboard')} rightAction={
        <Pressable onPress={handleLogout}><MaterialIcons name="logout" size={24} color={Colors.error} /></Pressable>
      } />
      <ScrollView contentContainerStyle={tw`px-5 pb-10 pt-4`}>
        <View style={tw`flex-row flex-wrap gap-3`}>
          {statCards.map((s) => (
            <Card key={s.label} style={tw`w-[47%]`}>
              <MaterialIcons name={s.icon as any} size={24} color={s.color} />
              <Text style={tw`text-2xl font-bold text-gray-900 mt-2`}>{s.value ?? 0}</Text>
              <Text style={tw`text-xs text-gray-500 mt-1`}>{s.label}</Text>
            </Card>
          ))}
        </View>

        <View style={tw`mt-6 bg-white rounded-2xl overflow-hidden`}>
          {menuItems.map((item, i) => (
            <Pressable key={item.label} onPress={() => router.push(item.route as any)} style={[tw`flex-row items-center px-5 py-4`, i < menuItems.length - 1 && tw`border-b border-gray-100`]}>
              <MaterialIcons name={item.icon as any} size={22} color={Colors.textSecondary} />
              <Text style={tw`flex-1 ml-4 text-base text-gray-900`}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.textLight} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
