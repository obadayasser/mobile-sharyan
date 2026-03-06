import { useState } from 'react';
import { View, Text, Switch, Pressable, Alert, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { donorService } from '@/services/donor.service';
import { Donor } from '@/types/donor';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from '@/i18n';

export default function Settings() {
  const { t } = useTranslation();
  const { userType, profile } = useAuth();
  const donor = userType === 'DONOR' ? (profile as Donor) : null;
  const [isAvailable, setIsAvailable] = useState(donor?.isAvailable ?? true);
  const isArabic = i18n.language === 'ar';

  const toggleLanguage = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    const shouldBeRTL = newLang === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      Alert.alert(t('common.done'), 'Please restart the app for language changes to take effect.');
    }
  };

  const toggleAvailability = async (val: boolean) => {
    setIsAvailable(val);
    try { await donorService.toggleAvailability(val); } catch { setIsAvailable(!val); }
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('settings.title')} showBack />
      <View style={tw`mt-4 mx-4 bg-white rounded-2xl overflow-hidden`}>
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
          <View style={tw`flex-row items-center justify-between px-5 py-4`}>
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
      </View>

      <View style={tw`items-center mt-10`}>
        <Text style={tw`text-xs text-gray-300`}>{t('settings.version')} 1.0.0</Text>
      </View>
    </View>
  );
}
