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
import { BloodTypePicker } from '@/components/blood/BloodTypePicker';
import { BloodType, Gender } from '@/constants/enums';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterDonor() {
  const { t } = useTranslation();
  const { setUserTypeAndRegister } = useAuth();
  const { location, loading: locLoading, requestLocation } = useLocation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('common.required');
    if (!bloodType) errs.bloodType = t('common.required');
    if (!location) errs.location = t('errors.locationError');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await setUserTypeAndRegister('DONOR', {
        name: name.trim(),
        bloodType: bloodType!,
        latitude: location!.latitude,
        longitude: location!.longitude,
        mobile: mobile.trim() || undefined,
        gender: gender || undefined,
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
        <Input
          label={t('register.name')}
          value={name}
          onChangeText={setName}
          placeholder={t('register.namePlaceholder')}
          error={errors.name}
        />

        <Input
          label={t('register.mobile')}
          value={mobile}
          onChangeText={setMobile}
          placeholder={t('register.mobilePlaceholder')}
          keyboardType="phone-pad"
        />

        <Text style={tw`text-sm font-semibold text-gray-700 mb-2 mt-4`}>
          {t('register.bloodType')} *
        </Text>
        <BloodTypePicker selected={bloodType} onSelect={setBloodType} />
        {errors.bloodType && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.bloodType}</Text>}

        <Text style={tw`text-sm font-semibold text-gray-700 mb-2 mt-6`}>
          {t('register.gender')}
        </Text>
        <View style={tw`flex-row gap-3`}>
          {(['MALE', 'FEMALE'] as Gender[]).map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              style={[
                tw`flex-1 py-3 rounded-xl border-2 items-center`,
                { borderColor: gender === g ? Colors.primary : '#E5E7EB', backgroundColor: gender === g ? Colors.primaryLight : 'white' },
              ]}
            >
              <Text style={[tw`font-semibold`, { color: gender === g ? Colors.primary : '#6B7280' }]}>
                {t(`register.${g === 'MALE' ? 'male' : 'female'}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={tw`text-sm font-semibold text-gray-700 mb-2 mt-6`}>
          {t('register.location')} *
        </Text>
        <Pressable
          onPress={requestLocation}
          style={[
            tw`py-3 px-4 rounded-xl border-2`,
            { borderColor: location ? Colors.success : errors.location ? Colors.error : '#E5E7EB' },
          ]}
        >
          <View style={tw`flex-row items-center`}>
            <MaterialIcons
              name={location ? 'check-circle' : 'my-location'}
              size={22}
              color={location ? Colors.success : Colors.primary}
            />
            <Text style={tw`ml-3 text-sm ${location ? 'text-green-600' : 'text-gray-500'} font-semibold`}>
              {locLoading ? t('common.loading') : location ? t('register.locationDetected') : t('register.detectLocation')}
            </Text>
          </View>
          {location?.address && (
            <Text style={tw`mt-1.5 text-sm text-gray-700 ml-8`} numberOfLines={2}>
              {location.address}
            </Text>
          )}
        </Pressable>
        {errors.location && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.location}</Text>}

        <View style={tw`mt-8`}>
          <Button
            title={loading ? t('register.registering') : t('register.register')}
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}
