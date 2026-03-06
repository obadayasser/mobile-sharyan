import { useState } from 'react';
import { View, Alert, ScrollView, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { useAuth } from '@/store/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterPatient() {
  const { t } = useTranslation();
  const { setUserTypeAndRegister } = useAuth();
  const { location, loading: locLoading, requestLocation } = useLocation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('common.required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await setUserTypeAndRegister('PATIENT', {
        name: name.trim(),
        mobile: mobile.trim() || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header title={t('register.title')} showBack />
      <ScrollView style={tw`flex-1 px-6`} contentContainerStyle={tw`pb-10 pt-4`}>
        <Input label={t('register.name')} value={name} onChangeText={setName} placeholder={t('register.namePlaceholder')} error={errors.name} />
        <Input label={t('register.mobile')} value={mobile} onChangeText={setMobile} placeholder={t('register.mobilePlaceholder')} keyboardType="phone-pad" />

        <Text style={tw`text-sm font-semibold text-gray-700 mb-2 mt-4`}>{t('register.location')}</Text>
        <Pressable onPress={requestLocation} style={[tw`flex-row items-center py-3 px-4 rounded-xl border-2`, { borderColor: location ? Colors.success : '#E5E7EB' }]}>
          <MaterialIcons name={location ? 'check-circle' : 'my-location'} size={22} color={location ? Colors.success : Colors.primary} />
          <Text style={tw`ml-3 text-sm ${location ? 'text-green-600' : 'text-gray-500'}`}>
            {locLoading ? t('common.loading') : location ? t('register.locationDetected') : t('register.detectLocation')}
          </Text>
        </Pressable>

        <View style={tw`mt-8`}>
          <Button title={loading ? t('register.registering') : t('register.register')} onPress={handleRegister} loading={loading} disabled={loading} />
        </View>
      </ScrollView>
    </View>
  );
}
