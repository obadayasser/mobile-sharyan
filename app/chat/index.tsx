import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { chatService } from '@/services/chat.service';
import { ChatRoom } from '@/types/chat';
import { useAuth } from '@/store/AuthContext';
import { timeAgo } from '@/utils/date';
import { Colors } from '@/constants/theme';

export default function ChatRooms() {
  const { t } = useTranslation();
  const { userType, profile } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatService.getRooms().then(setRooms).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const getOtherUser = (room: ChatRoom) => {
    if (userType === 'DONOR') return room.patient;
    return room.donor;
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('chat.title')} showBack />
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`pb-10`}
        renderItem={({ item }) => {
          const other = getOtherUser(item);
          return (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}`)}
              style={({ pressed }) => [tw`flex-row items-center px-5 py-4 bg-white border-b border-gray-100`, pressed && tw`bg-gray-50`]}
            >
              <Avatar name={other?.name || '?'} size={48} />
              <View style={tw`flex-1 ml-3`}>
                <Text style={tw`font-semibold text-gray-900`}>{other?.name || t('chat.title')}</Text>
                {item.lastMessage && (
                  <Text style={tw`text-sm text-gray-500 mt-0.5`} numberOfLines={1}>{item.lastMessage.content}</Text>
                )}
              </View>
              {item.lastMessage && (
                <Text style={tw`text-xs text-gray-400`}>{timeAgo(item.lastMessage.createdAt)}</Text>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState icon="chat" title={t('chat.noChats')} />}
      />
    </View>
  );
}
