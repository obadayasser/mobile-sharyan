import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BloodTypePicker } from '@/components/blood/BloodTypePicker';
import { useAuth } from '@/store/AuthContext';
import { Donor } from '@/types/donor';
import { Patient } from '@/types/patient';
import { BloodType } from '@/constants/enums';

export default function EditProfile() {
  const { t } = useTranslation();
  const { userType, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialize form based on user type
  const [name, setName] = useState((profile as any)?.name || '');
  const [mobile, setMobile] = useState((profile as any)?.mobile || '');
  const [bloodType, setBloodType] = useState<BloodType | null>(userType === 'DONOR' ? (profile as Donor)?.bloodType : null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const data: any = { name: name.trim() };
      if (mobile.trim()) data.mobile = mobile.trim();
      if (userType === 'DONOR' && bloodType) data.bloodType = bloodType;
      await updateProfile(data);
      Alert.alert(t('common.done'));
      router.back();
    } catch (e: any) { Alert.alert(t('common.error'), e?.message); }
    finally { setLoading(false); }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header title={t('profile.editProfile')} showBack />
      <ScrollView style={tw`flex-1 px-6`} contentContainerStyle={tw`pb-10 pt-4`}>
        <Input label={t('register.name')} value={name} onChangeText={setName} />
        <Input label={t('register.mobile')} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        {userType === 'DONOR' && (
          <>
            <Text style={tw`text-sm font-semibold text-gray-700 mb-2 mt-4`}>{t('register.bloodType')}</Text>
            <BloodTypePicker selected={bloodType} onSelect={setBloodType} />
          </>
        )}
        <View style={tw`mt-8`}><Button title={t('common.save')} onPress={handleSave} loading={loading} /></View>
      </ScrollView>
    </View>
  );
}
