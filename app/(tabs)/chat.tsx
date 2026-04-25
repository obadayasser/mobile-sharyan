import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  I18nManager,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { chatService } from '@/services/chat.service';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { useAuth } from '@/store/AuthContext';
import { useSocket } from '@/store/SocketContext';
import { timeAgo } from '@/utils/date';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ChatRoomsTab() {
  const { t } = useTranslation();
  const { userType, profile } = useAuth();
  const { chatSocket } = useSocket();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchRooms = useCallback(() => {
    return chatService
      .getRooms()
      .then((res) => setRooms(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchRooms().finally(() => setLoading(false));
  }, [fetchRooms]);

  useEffect(() => {
    if (rooms.length > 0) {
      console.log('[chat-list] first room (full)', JSON.stringify(rooms[0]));
    }
  }, [rooms]);

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [fetchRooms])
  );

  useEffect(() => {
    if (!chatSocket) return;
    const onMessage = (raw: any) => {
      const incomingRoomId = raw?.roomId ?? raw?.chatRoomId;
      const msg: ChatMessage = { ...raw, roomId: incomingRoomId };
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r.id === incomingRoomId);
        if (idx === -1) {
          fetchRooms();
          return prev;
        }
        const updated = { ...prev[idx], lastMessage: msg };
        const next = prev.slice();
        next.splice(idx, 1);
        return [updated, ...next];
      });
    };
    chatSocket.on('message', onMessage);
    return () => {
      chatSocket.off('message', onMessage);
    };
  }, [chatSocket, fetchRooms]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  }, [fetchRooms]);

  // Walks an object looking for any string-valued `name` field (or any of
  // the common alternates). Tolerates whatever shape the backend returns.
  const deepFindName = (obj: any, depth = 0): string | undefined => {
    if (!obj || typeof obj !== 'object' || depth > 4) return undefined;
    for (const key of ['name', 'fullName', 'userName', 'displayName']) {
      const v = obj[key];
      if (typeof v === 'string' && v.trim()) return v;
    }
    for (const key of Object.keys(obj)) {
      const v = obj[key];
      if (v && typeof v === 'object') {
        const found = deepFindName(v, depth + 1);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Treat a participant or message-sender as "me" if either its id matches
  // my profile.id OR its userType/senderType matches my current role.
  // Either check alone is enough — we OR them so a missing field on the
  // server side doesn't break us.
  const isSelfParticipant = (x: any): boolean => {
    if (!x) return false;
    const myId = (profile as any)?.id;
    const myUserId = (profile as any)?.userId;
    const xid = x.user?.id ?? x.userId ?? x.senderId ?? x.id;
    if (myId && xid && (xid === myId || xid === myUserId)) return true;
    const xType = (
      x.userType ??
      x.senderType ??
      x.type ??
      x.user?.userType ??
      ''
    )
      .toString()
      .toUpperCase();
    if (userType && xType && xType === userType) return true;
    return false;
  };

  const getOtherUser = (room: ChatRoom): { name: string } | undefined => {
    const r: any = room;

    if (Array.isArray(r.participants)) {
      const other = r.participants.find((x: any) => !isSelfParticipant(x));
      const n = deepFindName(other);
      if (n) return { name: n };
    }

    // Fallback: a message from someone whose sender role is not mine.
    const msgs: any[] = Array.isArray(r.messages) ? r.messages : [];
    const last = [...msgs].reverse().find(
      (m: any) => m?.senderName && !isSelfParticipant(m)
    );
    if (last?.senderName) return { name: last.senderName };

    return undefined;
  };

  const getLastMessage = (room: ChatRoom): ChatMessage | undefined => {
    const r: any = room;
    if (r.lastMessage) return r.lastMessage;
    if (Array.isArray(r.messages) && r.messages.length > 0) {
      return r.messages[r.messages.length - 1];
    }
    return undefined;
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return rooms;
    const q = search.trim().toLowerCase();
    return rooms.filter((r) => {
      const other = getOtherUser(r);
      const last = getLastMessage(r);
      return (
        (other?.name || '').toLowerCase().includes(q) ||
        (last?.content || '').toLowerCase().includes(q)
      );
    });
  }, [rooms, search, userType]);

  if (loading) return <LoadingSpinner />;

  const myId = (profile as any)?.id;

  return (
    <View style={[tw`flex-1`, { backgroundColor: Colors.background }]}>
      <Header title={t('chat.title')} />

      {rooms.length > 0 && (
        <View style={tw`px-4 pt-3 pb-2`}>
          <View
            style={[
              tw`flex-row items-center px-3.5 py-2.5 rounded-2xl`,
              {
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.borderLight,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={Colors.textLight} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('chat.search')}
              placeholderTextColor={Colors.textLight}
              textAlign={I18nManager.isRTL ? 'right' : 'left'}
              style={[
                tw`flex-1 mx-2 text-[14px]`,
                { color: Colors.text, paddingVertical: 0 },
              ]}
            />
            {search.length > 0 && (
              <Pressable hitSlop={8} onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textLight} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filtered.length === 0 ? tw`flex-1` : tw`pb-28 pt-1`
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ItemSeparatorComponent={() => (
          <View
            style={[
              tw`h-px`,
              I18nManager.isRTL ? tw`mr-[80px]` : tw`ml-[80px]`,
              { backgroundColor: Colors.borderLight },
            ]}
          />
        )}
        renderItem={({ item }) => {
          const other = getOtherUser(item);
          const last = getLastMessage(item);
          const hasMessage = !!last;
          const isOwnLast = hasMessage && myId === last!.senderId;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/chat/[roomId]',
                  params: { roomId: item.id, name: other?.name || '' },
                })
              }
              android_ripple={{ color: Colors.borderLight }}
              style={({ pressed }) => [
                tw`flex-row items-center px-4 py-3`,
                {
                  backgroundColor: pressed
                    ? Colors.borderLight
                    : Colors.surface,
                },
              ]}
            >
              <View>
                <Avatar name={other?.name || '?'} size={54} />
                <View
                  style={[
                    tw`absolute bottom-0 w-3.5 h-3.5 rounded-full`,
                    I18nManager.isRTL ? tw`left-0` : tw`right-0`,
                    {
                      backgroundColor: Colors.success,
                      borderWidth: 2,
                      borderColor: Colors.surface,
                    },
                  ]}
                />
              </View>

              <View style={tw`flex-1 ml-3`}>
                <View style={tw`flex-row items-center justify-between`}>
                  <Text
                    style={[
                      tw`font-semibold text-[16px] flex-1`,
                      { color: Colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {other?.name || t('chat.title')}
                  </Text>
                  {hasMessage && (
                    <Text
                      style={[tw`text-[11px] ml-2`, { color: Colors.textLight }]}
                    >
                      {timeAgo(last!.createdAt)}
                    </Text>
                  )}
                </View>

                <View style={tw`flex-row items-center mt-1`}>
                  {isOwnLast && (
                    <Ionicons
                      name="checkmark-done"
                      size={14}
                      color={Colors.textLight}
                      style={tw`mr-1`}
                    />
                  )}
                  {hasMessage ? (
                    <Text
                      style={[
                        tw`flex-1 text-[13px]`,
                        { color: Colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {last!.content}
                    </Text>
                  ) : (
                    <Text
                      style={[
                        tw`flex-1 text-[13px] italic`,
                        { color: Colors.textLight },
                      ]}
                      numberOfLines={1}
                    >
                      {t('chat.noMessages')}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="chat-bubble-outline"
            title={search.trim() ? t('chat.noResults') : t('chat.noChats')}
            subtitle={search.trim() ? undefined : t('bloodRequest.chat')}
          />
        }
      />
    </View>
  );
}
