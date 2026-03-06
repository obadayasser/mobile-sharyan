import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ScrollView, Switch, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { BloodRequestCard } from '@/components/blood/BloodRequestCard';
import { BloodTypeChip } from '@/components/blood/BloodTypeChip';
import { BloodBankCard } from '@/components/blood/BloodBankCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { bloodRequestService } from '@/services/blood-request.service';
import { patientService } from '@/services/patient.service';
import { bloodBankService } from '@/services/blood-bank.service';
import { donorService } from '@/services/donor.service';
import { BloodRequest } from '@/types/blood-request';
import { BloodBank } from '@/types/blood-bank';
import { BloodType, BLOOD_TYPES } from '@/constants/enums';
import { MaterialIcons } from '@expo/vector-icons';
import { Donor } from '@/types/donor';

export default function HomeTab() {
  const { userType } = useAuth();

  if (userType === 'DONOR') return <DonorHome />;
  if (userType === 'PATIENT') return <PatientHome />;
  if (userType === 'BLOOD_BANK') return <BloodBankHome />;
  return null;
}

function DonorHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const donor = profile as Donor;
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedType, setSelectedType] = useState<BloodType | null>(null);
  const [isAvailable, setIsAvailable] = useState(donor?.isAvailable ?? true);

  const fetchRequests = useCallback(async (p = 1, append = false) => {
    try {
      const params: any = { page: p, limit: 20, status: 'OPEN' };
      if (selectedType) params.bloodType = selectedType;
      const result = await bloodRequestService.list(params);
      if (append) {
        setRequests((prev) => [...prev, ...result.data]);
      } else {
        setRequests(result.data);
      }
      setHasMore(result.data.length === 20);
      setPage(p);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) fetchRequests(page + 1, true);
  };

  const toggleAvailability = async (val: boolean) => {
    setIsAvailable(val);
    try {
      await donorService.toggleAvailability(val);
    } catch {
      setIsAvailable(!val);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <View style={tw`bg-white px-5 pt-4 pb-3 border-b border-gray-100`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={tw`w-10 h-10 mr-3`}
              contentFit="contain"
            />
            <View>
              <Text style={tw`text-lg font-bold text-gray-900`}>
                {t('home.greeting')}, {donor?.name}
              </Text>
              <Text
                style={[
                  tw`text-xs`,
                  { color: isAvailable ? '#16A34A' : '#9CA3AF' },
                ]}
              >
                {isAvailable ? t('home.available') : t('home.unavailable')}
              </Text>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
            thumbColor={isAvailable ? Colors.primary : '#9CA3AF'}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tw`bg-white border-b border-gray-100`}
        contentContainerStyle={tw`px-4 py-3 gap-2`}
      >
        <BloodTypeChip
          bloodType={'ALL' as any}
          selected={!selectedType}
          onPress={() => setSelectedType(null)}
          label={t('common.all')}
        />
        {BLOOD_TYPES.map((type) => (
          <BloodTypeChip
            key={type}
            bloodType={type}
            selected={selectedType === type}
            onPress={() => setSelectedType(selectedType === type ? null : type)}
          />
        ))}
      </ScrollView>

      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={tw`px-4 mt-3`}>
              <BloodRequestCard
                request={item}
                onPress={() => router.push(`/blood-request/${item.id}`)}
              />
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={tw`pb-24 pt-2`}
          ListEmptyComponent={
            <EmptyState icon="bloodtype" title={t('home.noRequests')} />
          }
        />
      )}
    </SafeAreaView>
  );
}

function PatientHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      patientService.getMyRequests(1, 5).catch(() => ({ data: [] })),
      bloodBankService.list(1, 10).catch(() => ({ data: [] })),
    ]).then(([reqRes, bankRes]) => {
      setMyRequests((reqRes as any).data || []);
      setBanks((bankRes as any).data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <ScrollView contentContainerStyle={tw`pb-24`}>
        <View style={tw`bg-white px-5 pt-4 pb-4 border-b border-gray-100`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center`}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={tw`w-10 h-10 mr-3`}
                contentFit="contain"
              />
              <Text style={tw`text-lg font-bold text-gray-900`}>
                {t('home.greeting')}, {(profile as any)?.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`px-5 mt-4`}>
          <Button
            title={t('home.createRequest')}
            onPress={() => router.push('/blood-request/create')}
            icon={<MaterialIcons name="add" size={20} color="white" />}
          />
        </View>

        {myRequests.length > 0 && (
          <View style={tw`mt-6`}>
            <Text style={tw`text-lg font-bold text-gray-900 px-5 mb-3`}>
              {t('home.myRequests')}
            </Text>
            {myRequests.map((req) => (
              <View key={req.id} style={tw`px-4 mb-3`}>
                <BloodRequestCard
                  request={req}
                  onPress={() => router.push(`/blood-request/${req.id}`)}
                />
              </View>
            ))}
          </View>
        )}

        {banks.length > 0 && (
          <View style={tw`mt-6`}>
            <Text style={tw`text-lg font-bold text-gray-900 px-5 mb-3`}>
              {t('home.nearbyBanks')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-4 gap-3`}
            >
              {banks.map((bank) => (
                <View key={bank.id} style={tw`w-64`}>
                  <BloodBankCard
                    bloodBank={bank}
                    onPress={() => router.push(`/blood-bank/${bank.id}`)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BloodBankHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <View style={tw`bg-white px-5 pt-4 pb-4 border-b border-gray-100`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={tw`w-10 h-10 mr-3`}
            contentFit="contain"
          />
          <Text style={tw`text-lg font-bold text-gray-900`}>
            {(profile as any)?.name}
          </Text>
        </View>
      </View>
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-gray-500`}>{t('bloodBank.stock')}</Text>
      </View>
    </SafeAreaView>
  );
}
