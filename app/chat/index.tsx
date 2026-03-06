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
import { MaterialIcons } from '@expo/vector-icons';

export default function ChatRooms() {
  const { t } = useTranslation();
  const { userType } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatService.getRooms().then((res) => {
      setRooms(Array.isArray(res) ? res : []);
    }).catch(() => {}).finally(() => setLoading(false));
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
        contentContainerStyle={rooms.length === 0 ? tw`flex-1` : tw`pb-10`}
        renderItem={({ item, index }) => {
          const other = getOtherUser(item);
          const isLast = index === rooms.length - 1;
          return (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}`)}
              style={({ pressed }) => [
                tw`flex-row items-center px-4 py-3.5 mx-3 rounded-2xl`,
                pressed ? tw`bg-gray-100` : tw`bg-white`,
                !isLast && tw`mb-2`,
              ]}
            >
              <Avatar name={other?.name || '?'} size={50} />
              <View style={tw`flex-1 ml-3`}>
                <View style={tw`flex-row items-center justify-between`}>
                  <Text style={tw`font-bold text-base text-gray-900`} numberOfLines={1}>
                    {other?.name || t('chat.title')}
                  </Text>
                  {item.lastMessage && (
                    <Text style={tw`text-xs text-gray-400 ml-2`}>
                      {timeAgo(item.lastMessage.createdAt)}
                    </Text>
                  )}
                </View>
                {item.lastMessage ? (
                  <Text style={tw`text-sm text-gray-500 mt-1`} numberOfLines={1}>
                    {item.lastMessage.content}
                  </Text>
                ) : (
                  <Text style={tw`text-sm text-gray-400 mt-1 italic`}>
                    {t('chat.noMessages')}
                  </Text>
                )}
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textLight} style={tw`ml-1`} />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          rooms.length > 0 ? <View style={tw`h-3`} /> : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="chat-bubble-outline"
            title={t('chat.noChats')}
            subtitle={t('bloodRequest.chat')}
          />
        }
      />
    </View>
  );
}
