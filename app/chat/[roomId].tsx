import { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { chatService } from '@/services/chat.service';
import { useSocket } from '@/store/SocketContext';
import { useAuth } from '@/store/AuthContext';
import { ChatMessage } from '@/types/chat';

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
      setMessages(res.data.reverse());
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

  return (
    <KeyboardAvoidingView style={tw`flex-1 bg-gray-50`} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <Header title={t('chat.title')} showBack />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-4 py-3`}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <ChatBubble message={item} isOwn={item.senderId === (profile as any)?.id} />
        )}
      />
      {isTyping && <TypingIndicator />}
      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}
