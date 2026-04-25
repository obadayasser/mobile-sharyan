import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { Image } from 'expo-image';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/store/AuthContext';

const roles = [
  { key: 'donor', icon: 'bloodtype' as const, route: '/(auth)/register-donor' as const, color: '#DC2626' },
  { key: 'patient', icon: 'local-hospital' as const, route: '/(auth)/register-patient' as const, color: '#1E3A5F' },
  { key: 'bloodBank', icon: 'account-balance' as const, route: '/(auth)/register-blood-bank' as const, color: '#059669' },
];

const ROLE_LABEL_KEYS: Record<string, string> = {
  DONOR: 'onboarding.donor',
  PATIENT: 'onboarding.patient',
  BLOOD_BANK: 'onboarding.bloodBank',
};

export default function Onboarding() {
  const { t } = useTranslation();
  const { storedAccount, restoreLastAccount } = useAuth();
  const [restoring, setRestoring] = useState(false);

  const handleContinueAsStored = async () => {
    if (!storedAccount || restoring) return;
    setRestoring(true);
    const ok = await restoreLastAccount();
    setRestoring(false);
    if (ok) router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={tw`flex-1 bg-white`}
      contentContainerStyle={tw`px-6 pt-16 pb-10`}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <View style={tw`items-center mb-6`}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={tw`w-28 h-28`}
            contentFit="contain"
          />
        </View>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 300, type: 'timing', duration: 400 }}
      >
        <Text style={tw`text-3xl font-bold text-gray-900 text-center mb-2`}>
          {t('onboarding.welcome')}
        </Text>
        <Text style={tw`text-base text-gray-500 text-center mb-8`}>
          {t('onboarding.subtitle')}
        </Text>
      </MotiView>

      {storedAccount && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, type: 'timing', duration: 400 }}
        >
          <Pressable
            onPress={handleContinueAsStored}
            disabled={restoring}
            style={({ pressed }) => [
              tw`flex-row items-center p-5 rounded-2xl mb-4`,
              {
                backgroundColor: pressed ? Colors.primaryDark : Colors.primary,
                opacity: restoring ? 0.7 : 1,
              },
            ]}
          >
            <View
              style={[
                tw`w-12 h-12 rounded-full items-center justify-center mr-4`,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              <MaterialIcons name="person" size={24} color="white" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-bold text-white`} numberOfLines={1}>
                {t('onboarding.continueAs', { name: storedAccount.name })}
              </Text>
              <Text style={tw`text-xs text-white opacity-80 mt-0.5`}>
                {t(ROLE_LABEL_KEYS[storedAccount.type] || '')}
              </Text>
            </View>
            {restoring ? (
              <ActivityIndicator color="white" />
            ) : (
              <MaterialIcons name="login" size={22} color="white" />
            )}
          </Pressable>

          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`flex-1 h-px bg-gray-200`} />
            <Text style={tw`mx-3 text-xs uppercase text-gray-400 font-semibold`}>
              {t('onboarding.or')}
            </Text>
            <View style={tw`flex-1 h-px bg-gray-200`} />
          </View>
        </MotiView>
      )}

      <Text style={tw`text-lg font-semibold text-gray-700 text-center mb-6`}>
        {storedAccount
          ? t('onboarding.useDifferentAccount')
          : t('onboarding.selectRole')}
      </Text>

      <View style={tw`gap-4`}>
        {roles.map((role, index) => (
          <MotiView
            key={role.key}
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 500 + index * 150, type: 'timing', duration: 400 }}
          >
            <Pressable
              onPress={() => router.push(role.route)}
              style={({ pressed }) => [
                tw`flex-row items-center p-5 rounded-2xl border-2`,
                {
                  borderColor: role.color,
                  backgroundColor: pressed ? `${role.color}10` : 'white',
                },
              ]}
            >
              <View style={[tw`w-14 h-14 rounded-full items-center justify-center mr-4`, { backgroundColor: `${role.color}15` }]}>
                <MaterialIcons name={role.icon} size={28} color={role.color} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-lg font-bold`, { color: role.color }]}>
                  {t(`onboarding.${role.key}`)}
                </Text>
                <Text style={tw`text-sm text-gray-500 mt-1`}>
                  {t(`onboarding.${role.key}Desc`)}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={role.color} />
            </Pressable>
          </MotiView>
        ))}
      </View>
    </ScrollView>
  );
}
