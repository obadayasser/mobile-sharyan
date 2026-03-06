import { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BloodTypePicker } from '@/components/blood/BloodTypePicker';
import { useLocation } from '@/hooks/useLocation';
import { bloodRequestService } from '@/services/blood-request.service';
import { BloodType, BloodRequestUrgency } from '@/constants/enums';
import { MaterialIcons } from '@expo/vector-icons';

const urgencies: { key: BloodRequestUrgency; color: string }[] = [
  { key: 'NORMAL', color: Colors.normal },
  { key: 'URGENT', color: Colors.warning },
  { key: 'EMERGENCY', color: Colors.emergency },
];

export default function CreateBloodRequest() {
  const { t } = useTranslation();
  const { location, loading: locLoading, requestLocation } = useLocation();
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [bagsNeeded, setBagsNeeded] = useState('1');
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [urgency, setUrgency] = useState<BloodRequestUrgency>('NORMAL');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!bloodType) errs.bloodType = t('common.required');
    if (!patientName.trim()) errs.patientName = t('common.required');
    if (!location) errs.location = t('errors.locationError');
    if (!bagsNeeded || parseInt(bagsNeeded) < 1) errs.bagsNeeded = t('common.required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const req = await bloodRequestService.create({
        bloodType: bloodType!,
        bagsNeeded: parseInt(bagsNeeded),
        patientName: patientName.trim(),
        latitude: location!.latitude,
        longitude: location!.longitude,
        urgency,
        hospitalName: hospitalName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.replace(`/blood-request/${req.id}`);
    } catch (e: any) { Alert.alert(t('common.error'), e?.message); }
    finally { setLoading(false); }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header title={t('bloodRequest.create')} showBack />
      <ScrollView style={tw`flex-1 px-6`} contentContainerStyle={tw`pb-10 pt-4`}>
        <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>{t('bloodRequest.bloodType')} *</Text>
        <BloodTypePicker selected={bloodType} onSelect={setBloodType} />
        {errors.bloodType && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.bloodType}</Text>}

        <Input label={t('bloodRequest.patientName') + ' *'} value={patientName} onChangeText={setPatientName} error={errors.patientName} />
        <Input label={t('bloodRequest.bagsNeeded') + ' *'} value={bagsNeeded} onChangeText={setBagsNeeded} keyboardType="number-pad" error={errors.bagsNeeded} />
        <Input label={t('bloodRequest.hospitalName')} value={hospitalName} onChangeText={setHospitalName} />
        <Input label={t('bloodRequest.contactPhone')} value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
        <Input label={t('bloodRequest.notes')} value={notes} onChangeText={setNotes} placeholder={t('bloodRequest.notesPlaceholder')} multiline />

        <Text style={tw`text-sm font-semibold text-gray-700 mb-2 mt-4`}>{t('bloodRequest.urgency')}</Text>
        <View style={tw`flex-row gap-3`}>
          {urgencies.map((u) => (
            <Pressable
              key={u.key}
              onPress={() => setUrgency(u.key)}
              style={[
                tw`flex-1 py-3 rounded-xl border-2 items-center`,
                { borderColor: urgency === u.key ? u.color : '#E5E7EB', backgroundColor: urgency === u.key ? `${u.color}15` : 'white' },
              ]}
            >
              <Text style={[tw`font-semibold text-sm`, { color: urgency === u.key ? u.color : '#6B7280' }]}>
                {t(`bloodRequest.${u.key.toLowerCase()}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={tw`text-sm font-semibold text-gray-700 mb-2 mt-6`}>{t('register.location')} *</Text>
        <Pressable onPress={requestLocation} style={[tw`flex-row items-center py-3 px-4 rounded-xl border-2`, { borderColor: location ? Colors.success : errors.location ? Colors.error : '#E5E7EB' }]}>
          <MaterialIcons name={location ? 'check-circle' : 'my-location'} size={22} color={location ? Colors.success : Colors.primary} />
          <Text style={tw`ml-3 text-sm ${location ? 'text-green-600' : 'text-gray-500'}`}>
            {locLoading ? t('common.loading') : location ? t('register.locationDetected') : t('register.detectLocation')}
          </Text>
        </Pressable>
        {errors.location && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.location}</Text>}

        <View style={tw`mt-8`}>
          <Button title={t('common.submit')} onPress={handleSubmit} loading={loading} disabled={loading} />
        </View>
      </ScrollView>
    </View>
  );
}
