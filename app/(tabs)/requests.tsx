import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { BloodRequestCard } from '@/components/blood/BloodRequestCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { donorService } from '@/services/donor.service';
import { patientService } from '@/services/patient.service';
import { BloodRequest, DonationOffer } from '@/types/blood-request';
import { getBloodTypeLabel } from '@/utils/blood-type';
import { timeAgo } from '@/utils/date';

export default function RequestsTab() {
  const { userType } = useAuth();

  if (userType === 'DONOR') return <DonorOffers />;
  if (userType === 'PATIENT') return <PatientRequests />;
  return <BloodBankRequests />;
}

function DonorOffers() {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await donorService.getMyOffers(1, 50);
      setOffers(res.data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return Colors.warning;
      case 'ACCEPTED':
        return Colors.success;
      case 'COMPLETED':
        return Colors.primary;
      case 'REJECTED':
      case 'CANCELLED':
        return Colors.textLight;
      default:
        return Colors.textSecondary;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <View style={tw`bg-white px-5 py-4 border-b border-gray-100`}>
        <Text style={tw`text-xl font-bold text-gray-900`}>
          {t('profile.myOffers')}
        </Text>
      </View>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetch();
            }}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={tw`px-4 pb-24 pt-3`}
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              item.bloodRequest
                ? router.push(`/blood-request/${item.bloodRequestId}`)
                : null
            }
            style={tw`mb-3`}
          >
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <Text style={tw`font-bold text-gray-900`}>
                {item.bloodRequest?.patientName || t('bloodRequest.title')}
              </Text>
              <Badge
                label={item.status}
                color={getStatusColor(item.status)}
                variant="filled"
                size="sm"
              />
            </View>
            {item.bloodRequest && (
              <Text style={tw`text-sm text-gray-500`}>
                {getBloodTypeLabel(item.bloodRequest.bloodType)} -{' '}
                {item.bloodRequest.hospitalName || ''}
              </Text>
            )}
            {item.message && (
              <Text style={tw`text-sm text-gray-400 mt-1`}>{item.message}</Text>
            )}
            <Text style={tw`text-xs text-gray-400 mt-2`}>
              {timeAgo(item.createdAt)}
            </Text>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="volunteer-activism"
            title={t('bloodRequest.noOffers')}
          />
        }
      />
    </SafeAreaView>
  );
}

function PatientRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await patientService.getMyRequests(1, 50);
      setRequests(res.data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <View style={tw`bg-white px-5 py-4 border-b border-gray-100`}>
        <Text style={tw`text-xl font-bold text-gray-900`}>
          {t('home.myRequests')}
        </Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetch();
            }}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={tw`px-4 pb-24 pt-3`}
        renderItem={({ item }) => (
          <View style={tw`mb-3`}>
            <BloodRequestCard
              request={item}
              onPress={() => router.push(`/blood-request/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="list-alt" title={t('home.noRequests')} />
        }
      />
    </SafeAreaView>
  );
}

function BloodBankRequests() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <View style={tw`bg-white px-5 py-4 border-b border-gray-100`}>
        <Text style={tw`text-xl font-bold text-gray-900`}>
          {t('bloodBank.stock')}
        </Text>
      </View>
      <EmptyState icon="inventory" title={t('bloodBank.noStock')} />
    </SafeAreaView>
  );
}
