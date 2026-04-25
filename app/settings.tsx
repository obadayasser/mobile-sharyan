import { useState } from 'react';
import { View, Text, Switch, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { useNotificationCount } from '@/store/NotificationContext';
import { donorService } from '@/services/donor.service';
import { Donor } from '@/types/donor';
import { MaterialIcons } from '@expo/vector-icons';
import i18n, { setLanguage } from '@/i18n';

export default function Settings() {
  const { t } = useTranslation();
  const { userType, profile, switchRole } = useAuth();
  const { unreadCount } = useNotificationCount();
  const donor = userType === 'DONOR' ? (profile as Donor) : null;
  const [isAvailable, setIsAvailable] = useState(donor?.isAvailable ?? true);
  const [switching, setSwitching] = useState(false);
  const isArabic = i18n.language === 'ar';

  const canSwitchRole = userType === 'DONOR' || userType === 'PATIENT';
  const targetRole = userType === 'DONOR' ? 'PATIENT' : 'DONOR';
  const targetLabel = targetRole === 'DONOR' ? t('onboarding.donor') : t('onboarding.patient');

  const toggleLanguage = async () => {
    const newLang = isArabic ? 'en' : 'ar';
    const needsRestart = await setLanguage(newLang);
    if (needsRestart) {
      Alert.alert(
        t('common.done'),
        'Please fully close and reopen the app for the layout direction to update.'
      );
    }
  };

  const toggleAvailability = async (val: boolean) => {
    setIsAvailable(val);
    try { await donorService.toggleAvailability(val); } catch { setIsAvailable(!val); }
  };

  const handleSwitchRole = () => {
    Alert.alert(
      t('settings.switchRole'),
      t('settings.switchRoleConfirm', { role: targetLabel }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setSwitching(true);
            try {
              await switchRole(targetRole);
              Alert.alert(t('common.done'), t('settings.switchedRole', { role: targetLabel }));
              router.replace('/(tabs)');
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.message);
            } finally {
              setSwitching(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('settings.title')} showBack />
      <View style={tw`mt-4 mx-4 bg-white rounded-2xl overflow-hidden`}>
        <Pressable
          onPress={() => router.push('/notifications')}
          style={({ pressed }) => [
            tw`flex-row items-center justify-between px-5 py-4 border-b border-gray-100`,
            pressed && tw`bg-gray-50`,
          ]}
        >
          <View style={tw`flex-row items-center flex-1`}>
            <MaterialIcons name="notifications-none" size={22} color={Colors.textSecondary} />
            <Text style={tw`ml-4 text-base text-gray-900`}>{t('settings.notifications')}</Text>
          </View>
          {unreadCount > 0 && (
            <View
              style={[
                tw`min-w-5 h-5 px-1.5 rounded-full items-center justify-center mr-2`,
                { backgroundColor: Colors.primary },
              ]}
            >
              <Text style={tw`text-white text-[10px] font-bold`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
          <MaterialIcons
            name={isArabic ? 'chevron-left' : 'chevron-right'}
            size={20}
            color={Colors.textLight}
          />
        </Pressable>

        <Pressable
          onPress={() => router.push('/search')}
          style={({ pressed }) => [
            tw`flex-row items-center justify-between px-5 py-4 border-b border-gray-100`,
            pressed && tw`bg-gray-50`,
          ]}
        >
          <View style={tw`flex-row items-center flex-1`}>
            <MaterialIcons name="search" size={22} color={Colors.textSecondary} />
            <Text style={tw`ml-4 text-base text-gray-900`}>{t('search.title')}</Text>
          </View>
          <MaterialIcons
            name={isArabic ? 'chevron-left' : 'chevron-right'}
            size={20}
            color={Colors.textLight}
          />
        </Pressable>

        <Pressable onPress={toggleLanguage} style={tw`flex-row items-center justify-between px-5 py-4 border-b border-gray-100`}>
          <View style={tw`flex-row items-center`}>
            <MaterialIcons name="language" size={22} color={Colors.textSecondary} />
            <Text style={tw`ml-4 text-base text-gray-900`}>{t('settings.language')}</Text>
          </View>
          <Text style={[tw`text-sm font-semibold`, { color: Colors.primary }]}>
            {isArabic ? t('settings.english') : t('settings.arabic')}
          </Text>
        </Pressable>

        {userType === 'DONOR' && (
          <View style={tw`flex-row items-center justify-between px-5 py-4 border-b border-gray-100`}>
            <View style={tw`flex-row items-center flex-1`}>
              <MaterialIcons name="bloodtype" size={22} color={Colors.textSecondary} />
              <View style={tw`ml-4 flex-1`}>
                <Text style={tw`text-base text-gray-900`}>{t('settings.availability')}</Text>
                <Text style={tw`text-xs text-gray-500`}>{t('settings.availabilityDesc')}</Text>
              </View>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
              thumbColor={isAvailable ? Colors.primary : '#9CA3AF'}
            />
          </View>
        )}

        {canSwitchRole && (
          <Pressable
            onPress={handleSwitchRole}
            disabled={switching}
            style={({ pressed }) => [
              tw`flex-row items-center justify-between px-5 py-4`,
              pressed && tw`bg-gray-50`,
            ]}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <MaterialIcons name="swap-horiz" size={22} color={Colors.textSecondary} />
              <View style={tw`ml-4 flex-1`}>
                <Text style={tw`text-base text-gray-900`}>{t('settings.switchRole')}</Text>
                <Text style={tw`text-xs text-gray-500`}>{t('settings.switchRoleDesc')}</Text>
              </View>
            </View>
            <Text style={[tw`text-sm font-semibold`, { color: Colors.primary }]}>
              {switching ? t('common.loading') : targetLabel}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={tw`items-center mt-10`}>
        <Text style={tw`text-xs text-gray-300`}>{t('settings.version')} 1.0.0</Text>
      </View>
    </View>
  );
}
