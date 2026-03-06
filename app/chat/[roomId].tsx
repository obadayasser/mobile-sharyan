import { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { chatService } from '@/services/chat.service';
import { useSocket } from '@/store/SocketContext';
import { useAuth } from '@/store/AuthContext';
import { ChatMessage } from '@/types/chat';
import { Colors } from '@/constants/theme';

export default function ChatConversation() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { chatSocket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    chatService.getMessages(roomId!, 1, 100).then((res) => {
      const data = Array.isArray(res) ? res : res?.data;
      setMessages(Array.isArray(data) ? data.reverse() : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!chatSocket) return;

    const onMessage = (msg: ChatMessage) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
        setIsTyping(false);
      }
    };

    const onTyping = (data: { roomId: string }) => {
      if (data.roomId === roomId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    chatSocket.on('message', onMessage);
    chatSocket.on('typing', onTyping);

    return () => {
      chatSocket.off('message', onMessage);
      chatSocket.off('typing', onTyping);
    };
  }, [chatSocket, roomId]);

  const handleSend = useCallback((content: string) => {
    if (!chatSocket) return;
    chatSocket.emit('message', { roomId, content, type: 'TEXT' });
  }, [chatSocket, roomId]);

  const handleTyping = useCallback(() => {
    chatSocket?.emit('typing', { roomId });
  }, [chatSocket, roomId]);

  if (loading) return <LoadingSpinner />;

  const myId = (profile as any)?.id;

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <Header title={t('chat.title')} showBack />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          tw`px-4 pt-4 pb-2`,
          messages.length === 0 && tw`flex-1`,
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item, index }) => {
          const isOwn = item.senderId === myId;
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showDateSep = !prevMsg || new Date(item.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

          return (
            <>
              {showDateSep && (
                <View style={tw`items-center my-3`}>
                  <View style={tw`bg-gray-100 rounded-full px-3 py-1`}>
                    <Text style={tw`text-xs text-gray-400`}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}
              <ChatBubble message={item} isOwn={isOwn} />
            </>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="chat-bubble-outline"
            title={t('chat.noMessages')}
          />
        }
      />

      {isTyping && <TypingIndicator />}
      <ChatInput onSend={handleSend} onTyping={handleTyping} />
    </KeyboardAvoidingView>
  );
}
