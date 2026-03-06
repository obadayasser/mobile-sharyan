import { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
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

export default function RegisterBloodBank() {
  const { t } = useTranslation();
  const { setUserTypeAndRegister } = useAuth();
  const { location, loading: locLoading, requestLocation } = useLocation();
  const [form, setForm] = useState({ name: '', nameAr: '', phone: '', email: '', address: '', city: '', licenseNumber: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t('common.required');
    if (!location) errs.location = t('errors.locationError');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await setUserTypeAndRegister('BLOOD_BANK', {
        name: form.name.trim(),
        nameAr: form.nameAr.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        licenseNumber: form.licenseNumber.trim() || undefined,
        latitude: location!.latitude,
        longitude: location!.longitude,
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
        <Input label={t('register.name') + ' *'} value={form.name} onChangeText={(v) => updateField('name', v)} placeholder={t('register.namePlaceholder')} error={errors.name} />
        <Input label={t('register.nameAr')} value={form.nameAr} onChangeText={(v) => updateField('nameAr', v)} />
        <Input label={t('register.phone')} value={form.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
        <Input label={t('register.email')} value={form.email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" />
        <Input label={t('register.address')} value={form.address} onChangeText={(v) => updateField('address', v)} />
        <Input label={t('register.city')} value={form.city} onChangeText={(v) => updateField('city', v)} />
        <Input label={t('register.licenseNumber')} value={form.licenseNumber} onChangeText={(v) => updateField('licenseNumber', v)} />

        <Text style={tw`text-sm font-semibold text-gray-700 mb-2 mt-4`}>{t('register.location')} *</Text>
        <Pressable onPress={requestLocation} style={[tw`flex-row items-center py-3 px-4 rounded-xl border-2`, { borderColor: location ? Colors.success : errors.location ? Colors.error : '#E5E7EB' }]}>
          <MaterialIcons name={location ? 'check-circle' : 'my-location'} size={22} color={location ? Colors.success : Colors.primary} />
          <Text style={tw`ml-3 text-sm ${location ? 'text-green-600' : 'text-gray-500'}`}>
            {locLoading ? t('common.loading') : location ? t('register.locationDetected') : t('register.detectLocation')}
          </Text>
        </Pressable>
        {errors.location && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.location}</Text>}

        <Text style={tw`text-sm text-amber-600 mt-4 text-center`}>{t('register.pendingApproval')}</Text>

        <View style={tw`mt-6`}>
          <Button title={loading ? t('register.registering') : t('register.register')} onPress={handleRegister} loading={loading} disabled={loading} />
        </View>
      </ScrollView>
    </View>
  );
}
