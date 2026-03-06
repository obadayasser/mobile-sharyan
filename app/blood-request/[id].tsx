import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BloodTypeChip } from '@/components/blood/BloodTypeChip';
import { UrgencyIndicator } from '@/components/blood/UrgencyIndicator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Avatar } from '@/components/ui/Avatar';
import { bloodRequestService } from '@/services/blood-request.service';
import { donationOfferService } from '@/services/donation-offer.service';
import { shareService } from '@/services/share.service';
import { BloodRequest, DonationOffer } from '@/types/blood-request';
import { getBloodTypeLabel } from '@/utils/blood-type';
import { timeAgo, formatDate } from '@/utils/date';
import { shareBloodRequest } from '@/utils/share';
import { chatService } from '@/services/chat.service';
import { MaterialIcons } from '@expo/vector-icons';

export default function BloodRequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { userType, profile } = useAuth();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const req = await bloodRequestService.getById(id!);
      setRequest(req);
      const offersRes = await donationOfferService.getByRequest(id!);
      setOffers(offersRes);
    } catch { Alert.alert(t('common.error')); }
    finally { setLoading(false); }
  };

  const handleOffer = async () => {
    setActionLoading(true);
    try {
      await donationOfferService.create({ bloodRequestId: id! });
      Alert.alert(t('bloodRequest.offerSent'));
      loadData();
    } catch (e: any) { Alert.alert(t('common.error'), e?.message); }
    finally { setActionLoading(false); }
  };

  const handleShare = async () => {
    try {
      const { shareUrl } = await shareService.generateLink(id!);
      await shareBloodRequest(request!, shareUrl);
    } catch { await shareBloodRequest(request!); }
  };

  const handleNotifyDonors = async () => {
    try {
      const res = await bloodRequestService.notifyDonors(id!);
      Alert.alert(t('bloodRequest.donorsNotified', { count: res.donors.length }));
    } catch (e: any) { Alert.alert(t('common.error'), e?.message); }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try { await donationOfferService.accept(offerId); loadData(); } catch { }
  };

  const handleRejectOffer = async (offerId: string) => {
    try { await donationOfferService.reject(offerId); loadData(); } catch { }
  };

  const handleCompleteOffer = async (offerId: string) => {
    try { await donationOfferService.complete(offerId); loadData(); } catch { }
  };

  const handleStartChat = async () => {
    try {
      const room = await chatService.createRoom(id!);
      router.push(`/chat/${room.id}`);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message);
    }
  };

  if (loading || !request) return <LoadingSpinner />;

  const isOwner = userType === 'PATIENT' && (profile as any)?.id === request.patientId;
  const isDonor = userType === 'DONOR';
  const progress = request.bagsNeeded > 0 ? (request.bagsFulfilled / request.bagsNeeded) * 100 : 0;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('bloodRequest.title')} showBack />
      <ScrollView contentContainerStyle={tw`px-5 pb-32 pt-4`}>
        <Card>
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <BloodTypeChip bloodType={request.bloodType} selected />
            <UrgencyIndicator urgency={request.urgency} />
          </View>
          <Text style={tw`text-xl font-bold text-gray-900 mb-1`}>{request.patientName}</Text>
          {request.hospitalName && (
            <View style={tw`flex-row items-center mb-2`}>
              <MaterialIcons name="local-hospital" size={16} color={Colors.textSecondary} />
              <Text style={tw`ml-2 text-sm text-gray-500`}>{request.hospitalName}</Text>
            </View>
          )}
          {request.contactPhone && (
            <View style={tw`flex-row items-center mb-2`}>
              <MaterialIcons name="phone" size={16} color={Colors.textSecondary} />
              <Text style={tw`ml-2 text-sm text-gray-500`}>{request.contactPhone}</Text>
            </View>
          )}
          <View style={tw`mt-3`}>
            <Text style={tw`text-sm text-gray-700 font-semibold mb-1`}>
              {t('bloodRequest.bagsProgress', { fulfilled: request.bagsFulfilled, needed: request.bagsNeeded })}
            </Text>
            <View style={tw`h-2.5 bg-gray-200 rounded-full overflow-hidden`}>
              <View style={[tw`h-full rounded-full`, { width: `${Math.min(progress, 100)}%`, backgroundColor: Colors.primary }]} />
            </View>
          </View>
          {request.notes && <Text style={tw`text-sm text-gray-500 mt-3`}>{request.notes}</Text>}
          <Text style={tw`text-xs text-gray-400 mt-3`}>{timeAgo(request.createdAt)}</Text>
        </Card>

        {isDonor && request.status === 'OPEN' && (
          <View style={tw`mt-4`}>
            <Button title={t('bloodRequest.offerToDonate')} onPress={handleOffer} loading={actionLoading} fullWidth />
          </View>
        )}

        <View style={tw`flex-row gap-3 mt-3`}>
          {isDonor && (
            <View style={tw`flex-1`}>
              <Button title={t('chat.startChat')} variant="secondary" onPress={handleStartChat} icon={<MaterialIcons name="chat" size={18} color={Colors.primary} />} />
            </View>
          )}
          <View style={tw`flex-1`}>
            <Button title={t('bloodRequest.share')} variant="secondary" onPress={handleShare} icon={<MaterialIcons name="share" size={18} color={Colors.primary} />} />
          </View>
        </View>

        {isOwner && request.status === 'OPEN' && (
          <View style={tw`mt-3`}>
            <Button title={t('bloodRequest.notifyDonors')} variant="secondary" onPress={handleNotifyDonors} fullWidth />
          </View>
        )}

        {offers.length > 0 && (
          <View style={tw`mt-6`}>
            <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>{t('bloodRequest.offers')} ({offers.length})</Text>
            {offers.map((offer) => (
              <Card key={offer.id} style={tw`mb-3`}>
                <View style={tw`flex-row items-center`}>
                  <Avatar name={offer.donor?.name || '?'} size={40} />
                  <View style={tw`flex-1 ml-3`}>
                    <Text style={tw`font-semibold text-gray-900`}>{offer.donor?.name}</Text>
                    <Text style={tw`text-xs text-gray-500`}>{offer.donor?.bloodType ? getBloodTypeLabel(offer.donor.bloodType) : ''}</Text>
                  </View>
                  <Badge label={offer.status} color={offer.status === 'ACCEPTED' ? Colors.success : offer.status === 'COMPLETED' ? Colors.primary : Colors.warning} variant="filled" size="sm" />
                </View>
                {offer.message && <Text style={tw`text-sm text-gray-500 mt-2`}>{offer.message}</Text>}
                {isOwner && offer.status === 'PENDING' && (
                  <View style={tw`flex-row gap-3 mt-3`}>
                    <View style={tw`flex-1`}><Button title={t('bloodRequest.acceptOffer')} onPress={() => handleAcceptOffer(offer.id)} /></View>
                    <View style={tw`flex-1`}><Button title={t('bloodRequest.rejectOffer')} variant="secondary" onPress={() => handleRejectOffer(offer.id)} /></View>
                  </View>
                )}
                {offer.status === 'ACCEPTED' && (
                  <View style={tw`mt-3 gap-2`}>
                    <Button title={t('bloodRequest.completeOffer')} onPress={() => handleCompleteOffer(offer.id)} fullWidth />
                    {isOwner && (
                      <Button title={t('chat.startChat')} variant="secondary" onPress={handleStartChat} fullWidth icon={<MaterialIcons name="chat" size={18} color={Colors.primary} />} />
                    )}
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
