import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { gamificationService } from '@/services/gamification.service';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/store/AuthContext';
import { GamificationSummary } from '@/types/gamification';
import { ChatRoom } from '@/types/chat';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function DonorProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { userType } = useAuth();
  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [existingRoom, setExistingRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      gamificationService.getDonorSummary(id!).catch(() => null),
      chatService.getRooms().catch(() => []),
    ]).then(([sum, rooms]) => {
      setSummary(sum);
      // Find an existing chat room with this donor
      const room = Array.isArray(rooms) ? rooms.find((r: ChatRoom) => r.donorId === id) : null;
      if (room) setExistingRoom(room);
      setLoading(false);
    });
  }, [id]);

  const handleChat = () => {
    if (existingRoom) {
      router.push(`/chat/${existingRoom.id}`);
    } else {
      Alert.alert(t('chat.startChat'), t('bloodRequest.chat'));
      router.push('/chat');
    }
  };

  if (loading) return <LoadingSpinner />;

  const isPatient = userType === 'PATIENT';

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('donor.title')} showBack />
      <ScrollView contentContainerStyle={tw`px-5 pb-10 pt-4`}>
        <View style={tw`items-center`}>
          <Avatar name="D" size={80} />
        </View>
        {summary && (
          <>
            <View style={tw`flex-row items-center gap-4 mt-4`}>
              <Card style={tw`flex-1 items-center`}>
                <Text style={[tw`text-2xl font-bold`, { color: Colors.primary }]}>{summary.points}</Text>
                <Text style={tw`text-xs text-gray-500`}>{t('common.points')}</Text>
              </Card>
              <Card style={tw`flex-1 items-center`}>
                <Text style={tw`text-2xl font-bold text-gray-900`}>{summary.totalDonations}</Text>
                <Text style={tw`text-xs text-gray-500`}>{t('donor.totalDonations')}</Text>
              </Card>
            </View>

            {isPatient && (
              <View style={tw`mt-4`}>
                <Button
                  title={existingRoom ? t('bloodRequest.chat') : t('chat.startChat')}
                  variant="secondary"
                  onPress={handleChat}
                  fullWidth
                  icon={<MaterialIcons name="chat" size={18} color={Colors.primary} />}
                />
              </View>
            )}

            {summary.badges.length > 0 && (
              <View style={tw`mt-6`}>
                <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>{t('gamification.badges')}</Text>
                <View style={tw`flex-row flex-wrap gap-3`}>
                  {summary.badges.map((b) => (
                    <BadgeCard key={b.badge} badge={b.badge} earned earnedAt={b.earnedAt} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
