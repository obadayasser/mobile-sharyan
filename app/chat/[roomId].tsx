import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  Pressable,
  I18nManager,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { chatService } from '@/services/chat.service';
import { bloodRequestService } from '@/services/blood-request.service';
import { useSocket } from '@/store/SocketContext';
import { useAuth } from '@/store/AuthContext';
import { ChatMessage } from '@/types/chat';
import { Colors } from '@/constants/theme';

const CHAT_BG = '#F2F4F7';
const GROUP_WINDOW_MS = 5 * 60 * 1000;

export default function ChatConversation() {
  const { roomId, name } = useLocalSearchParams<{
    roomId: string;
    name?: string;
  }>();
  const { t } = useTranslation();
  const { profile, userType } = useAuth();
  const { chatSocket, isChatConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [resolvedName, setResolvedName] = useState<string>(
    typeof name === 'string' ? name : ''
  );
  const flatListRef = useRef<FlatList>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const otherName =
    resolvedName && resolvedName.length > 0 ? resolvedName : t('chat.title');

  // Walk any object looking for a string-valued `name` (or alternates).
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

  // True if this participant or message-sender is *me* — by id OR by role.
  // Either check is enough; we OR them so a missing field doesn't break us.
  const isSelf = (x: any): boolean => {
    if (!x) return false;
    const myId = (profile as any)?.id;
    const myUserId = (profile as any)?.userId;
    const xid = x.user?.id ?? x.userId ?? x.senderId ?? x.id;
    if (myId && xid && (xid === myId || xid === myUserId)) return true;
    const xType = (x.userType ?? x.senderType ?? x.type ?? x.user?.userType ?? '')
      .toString()
      .toUpperCase();
    if (userType && xType && xType === userType) return true;
    return false;
  };

  // Resolve the other participant's name. Strategy, in order:
  //   1) The `name` route param.
  //   2) `senderName` of any message not sent by me.
  //   3) The room's `participants` array, walked deeply for any name field.
  //   4) `senderName` from messages embedded in the room object.
  //   5) The blood request's `patientName`.
  useEffect(() => {
    if (resolvedName) return;

    // (2)
    const fromMsg = messages.find(
      (m: any) => !isSelf(m) && m?.senderName
    ) as any;
    if (fromMsg?.senderName) {
      setResolvedName(fromMsg.senderName);
      return;
    }

    chatService
      .getRooms()
      .then(async (rooms) => {
        const room: any = rooms.find((r) => r.id === roomId);
        if (!room) return;
        console.log('[chat] room (full)', JSON.stringify(room));

        // (3)
        const participants: any[] = Array.isArray(room.participants)
          ? room.participants
          : [];
        const other = participants.find((p) => !isSelf(p));
        const fromParticipant = deepFindName(other);
        if (fromParticipant) {
          setResolvedName(fromParticipant);
          return;
        }

        // (4)
        const roomMsgs: any[] = Array.isArray(room.messages) ? room.messages : [];
        const fromRoomMsg = roomMsgs.find(
          (m: any) => !isSelf(m) && m?.senderName
        );
        if (fromRoomMsg?.senderName) {
          setResolvedName(fromRoomMsg.senderName);
          return;
        }

        // (5)
        if (room.bloodRequestId) {
          try {
            const br: any = await bloodRequestService.getById(room.bloodRequestId);
            if (br?.patientName) setResolvedName(br.patientName);
          } catch {}
        }
      })
      .catch(() => {});
  }, [roomId, resolvedName, profile, userType, messages]);

  useEffect(() => {
    chatService
      .getMessages(roomId!, 1, 100)
      .then((res: any) => {
        const data = Array.isArray(res) ? res : res?.data;
        const normalized: ChatMessage[] = Array.isArray(data)
          ? data.map((m: any) => ({ ...m, roomId: m.roomId ?? m.chatRoomId }))
          : [];
        setMessages([...normalized].reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!chatSocket) {
      console.log('[chat] no socket yet, skip listeners');
      return;
    }
    console.log('[chat] attaching listeners', {
      roomId,
      connected: chatSocket.connected,
    });

    chatSocket.emit('joinRoom', { roomId }, (ack: any) => {
      console.log('[chat] joinRoom ack', ack);
    });

    const onMessage = (raw: any) => {
      console.log('[chat] <- message', raw);
      // Server sends `chatRoomId`; we normalise to `roomId` for our types.
      const incomingRoomId = raw?.roomId ?? raw?.chatRoomId;
      if (incomingRoomId !== roomId) return;
      const msg: ChatMessage = { ...raw, roomId: incomingRoomId };

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const idx = prev.findIndex(
          (m) =>
            String(m.id).startsWith('temp-') &&
            m.senderId === msg.senderId &&
            m.content === msg.content
        );
        if (idx !== -1) {
          const next = prev.slice();
          next[idx] = msg;
          return next;
        }
        return [...prev, msg];
      });
      setIsTyping(false);
    };

    const onTyping = (data: { roomId: string; userId?: string }) => {
      if (data.roomId !== roomId) return;
      // Don't show our own typing event echoed back.
      if (data.userId && data.userId === (profile as any)?.id) return;
      setIsTyping(true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 3000);
    };

    chatSocket.on('message', onMessage);
    // Server emits `userTyping`, not `typing`.
    chatSocket.on('userTyping', onTyping);

    return () => {
      console.log('[chat] detaching listeners', { roomId });
      chatSocket.emit('leaveRoom', { roomId });
      chatSocket.off('message', onMessage);
      chatSocket.off('userTyping', onTyping);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [chatSocket, roomId]);

  const myId = (profile as any)?.id;

  const handleSend = useCallback(
    (content: string) => {
      if (!chatSocket) {
        console.warn('[chat] send aborted: socket is null');
        return;
      }
      if (!chatSocket.connected) {
        console.warn('[chat] send aborted: socket not connected');
      }

      // Optimistic UI: render the bubble immediately, then swap with the
      // server-confirmed row when the ack (or broadcast) arrives.
      const now = new Date();
      const optimistic: ChatMessage = {
        id: `temp-${now.getTime()}`,
        roomId: roomId!,
        senderId: myId,
        senderType: '',
        content,
        type: 'TEXT' as any,
        createdAt: now.toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      console.log('[chat] -> emit message', { roomId, content });
      chatSocket.emit(
        'message',
        { roomId, content, type: 'TEXT' },
        (ack: any) => {
          console.log('[chat] message ack', ack);
          if (ack && ack.id) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === optimistic.id ? (ack as ChatMessage) : m
              )
            );
          }
        }
      );
    },
    [chatSocket, roomId, myId]
  );

  const handleTyping = useCallback(() => {
    chatSocket?.emit('typing', { roomId });
  }, [chatSocket, roomId]);

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: CHAT_BG }]}
      edges={['top', 'bottom']}
    >
      <View
        style={[
          tw`flex-row items-center px-2 py-2`,
          {
            backgroundColor: Colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: Colors.borderLight,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={tw`w-10 h-10 items-center justify-center`}
        >
          <Ionicons
            name={I18nManager.isRTL ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color={Colors.text}
          />
        </Pressable>

        <View style={tw`flex-row items-center flex-1 ml-1`}>
          <View>
            <Avatar name={otherName} size={38} />
            <View
              style={[
                tw`absolute bottom-0 w-2.5 h-2.5 rounded-full`,
                I18nManager.isRTL ? tw`left-0` : tw`right-0`,
                {
                  backgroundColor: Colors.success,
                  borderWidth: 1.5,
                  borderColor: Colors.surface,
                },
              ]}
            />
          </View>
          <View style={tw`ml-2.5 flex-1`}>
            <Text
              style={[tw`font-semibold text-[15px]`, { color: Colors.text }]}
              numberOfLines={1}
            >
              {otherName}
            </Text>
            <Text
              style={[
                tw`text-[11px]`,
                { color: isTyping ? Colors.primary : Colors.success },
              ]}
              numberOfLines={1}
            >
              {isTyping ? t('chat.typing') : t('chat.online')}
            </Text>
          </View>
        </View>

        <Pressable hitSlop={8} style={tw`w-10 h-10 items-center justify-center`}>
          <Ionicons name="call-outline" size={20} color={Colors.text} />
        </Pressable>
      </View>

      {!isChatConnected && (
        <View
          style={[
            tw`px-3 py-1.5 items-center`,
            { backgroundColor: '#FEF3C7' },
          ]}
        >
          <Text style={[tw`text-[11px]`, { color: '#92400E' }]}>
            {t('chat.connecting') /* fallback if missing */}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              tw`px-3 pt-3 pb-2`,
              messages.length === 0 && tw`flex-1`,
            ]}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item, index }) => {
              const isOwn = item.senderId === myId;
              const prev = index > 0 ? messages[index - 1] : null;
              const next =
                index < messages.length - 1 ? messages[index + 1] : null;

              const sameDayAsPrev =
                !!prev &&
                new Date(item.createdAt).toDateString() ===
                  new Date(prev.createdAt).toDateString();
              const showDateSep = !sameDayAsPrev;

              const sameSenderAsPrev =
                !!prev &&
                prev.senderId === item.senderId &&
                sameDayAsPrev &&
                new Date(item.createdAt).getTime() -
                  new Date(prev.createdAt).getTime() <
                  GROUP_WINDOW_MS;

              const sameSenderAsNext =
                !!next &&
                next.senderId === item.senderId &&
                new Date(item.createdAt).toDateString() ===
                  new Date(next.createdAt).toDateString() &&
                new Date(next.createdAt).getTime() -
                  new Date(item.createdAt).getTime() <
                  GROUP_WINDOW_MS;

              return (
                <View>
                  {showDateSep && (
                    <View style={tw`items-center my-3`}>
                      <View
                        style={[
                          tw`px-3 py-1 rounded-full`,
                          { backgroundColor: 'rgba(0,0,0,0.06)' },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-[11px] font-medium`,
                            { color: Colors.textSecondary },
                          ]}
                        >
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  )}
                  <ChatBubble
                    message={item}
                    isOwn={isOwn}
                    isFirstInGroup={!sameSenderAsPrev}
                    isLastInGroup={!sameSenderAsNext}
                  />
                </View>
              );
            }}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
            ListEmptyComponent={
              <EmptyState
                icon="chat-bubble-outline"
                title={t('chat.noMessages')}
              />
            }
          />
        )}

        <ChatInput onSend={handleSend} onTyping={handleTyping} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
