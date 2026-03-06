import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { BloodTypeChip } from '@/components/blood/BloodTypeChip';
import { MaterialIcons } from '@expo/vector-icons';
import { Donor } from '@/types/donor';

const APP_VERSION = '1.0.0';

export default function ProfileTab() {
  const { t } = useTranslation();
  const { userType, profile, logout } = useAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  const donor = userType === 'DONOR' ? (profile as Donor) : null;

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.yes'),
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'edit' as const,
      label: t('profile.editProfile'),
      onPress: () => router.push('/edit-profile'),
    },
    ...(userType === 'DONOR'
      ? [
          {
            icon: 'military-tech' as const,
            label: t('profile.myBadges'),
            onPress: () => router.push('/gamification/badges'),
          },
          {
            icon: 'stars' as const,
            label: t('profile.myPoints'),
            onPress: () => router.push('/gamification/points'),
          },
          {
            icon: 'leaderboard' as const,
            label: t('profile.leaderboard'),
            onPress: () => router.push('/gamification/leaderboard'),
          },
        ]
      : []),
    {
      icon: 'campaign' as const,
      label: t('profile.campaigns'),
      onPress: () => router.push('/campaigns'),
    },
    {
      icon: 'chat' as const,
      label: t('profile.chat'),
      onPress: () => router.push('/chat'),
    },
    {
      icon: 'settings' as const,
      label: t('profile.settings'),
      onPress: () => router.push('/settings'),
    },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <ScrollView contentContainerStyle={tw`pb-24`}>
        <View
          style={tw`bg-white px-5 pt-6 pb-6 items-center border-b border-gray-100`}
        >
          <Avatar name={(profile as any)?.name || '?'} size={80} />
          <Text style={tw`text-xl font-bold text-gray-900 mt-3`}>
            {(profile as any)?.name}
          </Text>
          {donor && (
            <View style={tw`flex-row items-center mt-2 gap-3`}>
              <BloodTypeChip bloodType={donor.bloodType} selected />
              <Text style={tw`text-sm text-gray-500`}>
                {t('donor.totalDonations')}: {donor.totalDonations}
              </Text>
            </View>
          )}
          {donor && (
            <Text
              style={[
                tw`text-sm font-semibold mt-2`,
                { color: Colors.primary },
              ]}
            >
              {donor.points} {t('common.points')}
            </Text>
          )}
        </View>

        <View style={tw`mt-4 mx-4 bg-white rounded-2xl overflow-hidden`}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                tw`flex-row items-center px-5 py-4`,
                pressed && tw`bg-gray-50`,
                index < menuItems.length - 1 &&
                  tw`border-b border-gray-100`,
              ]}
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={Colors.textSecondary}
              />
              <Text style={tw`flex-1 ml-4 text-base text-gray-900`}>
                {item.label}
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={Colors.textLight}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleLogout}
          style={tw`mx-4 mt-4 bg-white rounded-2xl flex-row items-center px-5 py-4`}
        >
          <MaterialIcons name="logout" size={22} color={Colors.error} />
          <Text
            style={[
              tw`ml-4 text-base font-semibold`,
              { color: Colors.error },
            ]}
          >
            {t('profile.logout')}
          </Text>
        </Pressable>

        {/* Hidden admin access - long press version number for 3 seconds */}
        <Pressable
          onLongPress={() => setShowAdmin(true)}
          delayLongPress={3000}
          style={tw`items-center mt-8 mb-4`}
        >
          <Text style={tw`text-xs text-gray-300`}>
            {t('profile.version')} {APP_VERSION}
          </Text>
        </Pressable>

        {showAdmin && (
          <View style={tw`mx-4 mb-4`}>
            <Pressable
              onPress={() => router.push('/admin/login')}
              style={tw`bg-gray-100 rounded-xl py-3 items-center`}
            >
              <Text style={tw`text-sm text-gray-500`}>
                {t('admin.login')}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
