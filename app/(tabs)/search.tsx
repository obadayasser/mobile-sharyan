import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
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

type Tab = 'donors' | 'banks';

export default function SearchTab() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('donors');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [donors, setDonors] = useState<DonorSearchResult[]>([]);
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 30, availableOnly: true };
      if (bloodType) params.bloodType = bloodType;
      const res = await donorService.search(params);
      setDonors(res.data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [bloodType]);

  const searchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bloodBankService.list(1, 30);
      setBanks(res.data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'donors') searchDonors();
    else searchBanks();
  }, [tab, searchDonors, searchBanks]);

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <View style={tw`bg-white px-5 py-4 border-b border-gray-100`}>
        <Text style={tw`text-xl font-bold text-gray-900 mb-3`}>
          {t('search.title')}
        </Text>
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
                  {
                    color:
                      tab === t2 ? Colors.primary : Colors.textSecondary,
                  },
                ]}
              >
                {t(
                  `search.${t2 === 'donors' ? 'donors' : 'bloodBanks'}`
                )}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === 'donors' && (
        <View style={tw`bg-white px-5 py-3 border-b border-gray-100`}>
          <Pressable onPress={() => setShowFilters(!showFilters)}>
            <Text
              style={[
                tw`text-sm font-semibold`,
                { color: Colors.primary },
              ]}
            >
              {t('search.filterByBloodType')} {showFilters ? '\u25B2' : '\u25BC'}
            </Text>
          </Pressable>
          {showFilters && (
            <View style={tw`mt-3`}>
              <BloodTypePicker
                selected={bloodType}
                onSelect={(bt) =>
                  setBloodType(bt === bloodType ? null : bt)
                }
              />
            </View>
          )}
        </View>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : tab === 'donors' ? (
        <FlatList
          data={donors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-4 pb-24 pt-3`}
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
          contentContainerStyle={tw`px-4 pb-24 pt-3`}
          renderItem={({ item }) => (
            <View style={tw`mb-3`}>
              <BloodBankCard
                bloodBank={item}
                onPress={() => router.push(`/blood-bank/${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="account-balance"
              title={t('search.noResults')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
