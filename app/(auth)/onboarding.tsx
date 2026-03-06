import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { Image } from 'expo-image';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const roles = [
  { key: 'donor', icon: 'bloodtype' as const, route: '/(auth)/register-donor' as const, color: '#DC2626' },
  { key: 'patient', icon: 'local-hospital' as const, route: '/(auth)/register-patient' as const, color: '#1E3A5F' },
  { key: 'bloodBank', icon: 'account-balance' as const, route: '/(auth)/register-blood-bank' as const, color: '#059669' },
];

export default function Onboarding() {
  const { t } = useTranslation();

  return (
    <View style={tw`flex-1 bg-white px-6 pt-20`}>
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
        <Text style={tw`text-base text-gray-500 text-center mb-10`}>
          {t('onboarding.subtitle')}
        </Text>
      </MotiView>

      <Text style={tw`text-lg font-semibold text-gray-700 text-center mb-6`}>
        {t('onboarding.selectRole')}
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
    </View>
  );
}
