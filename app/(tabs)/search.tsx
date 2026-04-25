import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { DonorCard } from '@/components/blood/DonorCard';
import { BloodBankCard } from '@/components/blood/BloodBankCard';
import { BloodTypePicker } from '@/components/blood/BloodTypePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { donorService } from '@/services/donor.service';
import { bloodBankService } from '@/services/blood-bank.service';
import { DonorSearchResult } from '@/types/donor';
import { BloodBank } from '@/types/blood-bank';
import { BloodType } from '@/constants/enums';
import { useAuth } from '@/store/AuthContext';
import { useAddress } from '@/hooks/useAddress';

type Tab = 'donors' | 'banks';
type RadiusOption = 5 | 10 | 25 | 50 | 100 | null;

const RADIUS_OPTIONS: RadiusOption[] = [5, 10, 25, 50, 100, null];

export default function SearchTab() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const myLat = (profile as any)?.latitude as number | undefined;
  const myLng = (profile as any)?.longitude as number | undefined;
  const myAddress = useAddress(myLat, myLng);
  const hasLocation = myLat != null && myLng != null;

  const [tab, setTab] = useState<Tab>('donors');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [radiusKm, setRadiusKm] = useState<RadiusOption>(25);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [includeCompatible, setIncludeCompatible] = useState(false);
  const [donors, setDonors] = useState<DonorSearchResult[]>([]);
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(false);

  const searchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 30, availableOnly };
      if (bloodType) {
        params.bloodType = bloodType;
        params.includeCompatible = includeCompatible;
      }
      if (hasLocation && radiusKm != null) {
        params.latitude = myLat;
        params.longitude = myLng;
        params.radiusKm = radiusKm;
      }
      const res = await donorService.search(params);
      setDonors(res.data);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, [bloodType, radiusKm, availableOnly, includeCompatible, myLat, myLng, hasLocation]);

  const searchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bloodBankService.list(1, 30);
      setBanks(res.data);
    } catch {
      setBanks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'donors') searchDonors();
    else searchBanks();
  }, [tab, searchDonors, searchBanks]);

  const radiusLabel = useCallback(
    (r: RadiusOption) => (r == null ? t('search.anyDistance') : `${r} ${t('common.km')}`),
    [t]
  );

  const data = tab === 'donors' ? donors : banks;
  const resultsLabel = useMemo(
    () => t('search.resultsCount', { count: data.length }),
    [data.length, t]
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <View style={tw`bg-white px-5 pt-4 pb-3 border-b border-gray-100`}>
        <Text style={tw`text-xl font-bold text-gray-900 mb-1`}>{t('search.title')}</Text>
        {myAddress && (
          <View style={tw`flex-row items-center mb-3`}>
            <MaterialIcons name="location-on" size={13} color={Colors.textSecondary} />
            <Text style={tw`text-xs text-gray-500 ml-1`} numberOfLines={1}>
              {myAddress}
            </Text>
          </View>
        )}
        <View style={tw`flex-row bg-gray-100 rounded-xl p-1`}>
          {(['donors', 'banks'] as Tab[]).map((t2) => (
            <Pressable
              key={t2}
              onPress={() => setTab(t2)}
              style={[
                tw`flex-1 py-2.5 rounded-lg items-center`,
                tab === t2 && tw`bg-white shadow-sm`,
              ]}
            >
              <Text
                style={[
                  tw`font-semibold text-sm`,
                  { color: tab === t2 ? Colors.primary : Colors.textSecondary },
                ]}
              >
                {t(`search.${t2 === 'donors' ? 'donors' : 'bloodBanks'}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === 'donors' && (
        <View style={tw`bg-white px-5 py-4 border-b border-gray-100`}>
          <Text style={tw`text-xs font-bold text-gray-500 uppercase mb-2`}>
            {t('search.filterByBloodType')}
          </Text>
          <BloodTypePicker
            selected={bloodType}
            onSelect={(bt) => setBloodType(bt === bloodType ? null : bt)}
          />

          <View style={tw`mt-4`}>
            <Text style={tw`text-xs font-bold text-gray-500 uppercase mb-2`}>
              {t('search.radius')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`py-1`}
            >
              <View style={tw`flex-row gap-2`}>
                {RADIUS_OPTIONS.map((r) => {
                  const selected = radiusKm === r;
                  const disabled = !hasLocation && r != null;
                  return (
                    <Pressable
                      key={String(r)}
                      onPress={() => !disabled && setRadiusKm(r)}
                      disabled={disabled}
                      style={[
                        tw`px-4 py-2 rounded-full border`,
                        {
                          backgroundColor: selected ? Colors.primary : 'white',
                          borderColor: selected ? Colors.primary : Colors.border,
                          opacity: disabled ? 0.4 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          tw`text-sm font-semibold`,
                          { color: selected ? 'white' : Colors.text },
                        ]}
                      >
                        {radiusLabel(r)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            {!hasLocation && (
              <Text style={tw`text-xs text-amber-600 mt-2`}>
                {t('search.needLocation')}
              </Text>
            )}
          </View>

          <View style={tw`flex-row items-center justify-between mt-4`}>
            <Text style={tw`text-sm text-gray-700 flex-1`}>
              {t('search.availableOnly')}
            </Text>
            <Switch
              value={availableOnly}
              onValueChange={setAvailableOnly}
              trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
              thumbColor={availableOnly ? Colors.primary : '#9CA3AF'}
            />
          </View>

          {bloodType && (
            <View style={tw`flex-row items-center justify-between mt-2`}>
              <Text style={tw`text-sm text-gray-700 flex-1`}>
                {t('search.includeCompatible')}
              </Text>
              <Switch
                value={includeCompatible}
                onValueChange={setIncludeCompatible}
                trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
                thumbColor={includeCompatible ? Colors.primary : '#9CA3AF'}
              />
            </View>
          )}
        </View>
      )}

      {!loading && (
        <View style={tw`px-5 py-2`}>
          <Text style={tw`text-xs text-gray-500`}>{resultsLabel}</Text>
        </View>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : tab === 'donors' ? (
        <FlatList
          data={donors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-4 pb-28 pt-1`}
          renderItem={({ item }) => (
            <View style={tw`mb-3`}>
              <DonorCard
                donor={item}
                onPress={() => router.push(`/donor/${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState icon="person-search" title={t('donor.noDonors')} />
          }
        />
      ) : (
        <FlatList
          data={banks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-4 pb-28 pt-1`}
          renderItem={({ item }) => (
            <View style={tw`mb-3`}>
              <BloodBankCard
                bloodBank={item}
                onPress={() => router.push(`/blood-bank/${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState icon="account-balance" title={t('search.noResults')} />
          }
        />
      )}
    </SafeAreaView>
  );
}
