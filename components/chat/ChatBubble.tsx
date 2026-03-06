import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { ChatMessage } from '@/types/chat';
import { Colors } from '@/constants/theme';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[tw`mb-2`, isOwn ? tw`items-end` : tw`items-start`]}>
      <View
        style={[
          tw`rounded-2xl px-4 py-2.5`,
          { maxWidth: '80%' },
          isOwn
            ? [tw`rounded-br-sm`, { backgroundColor: Colors.primary }]
            : [tw`rounded-bl-sm`, tw`bg-gray-100`],
        ]}
      >
        <Text
          style={[
            tw`text-base leading-snug`,
            { color: isOwn ? Colors.white : Colors.text },
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            tw`text-xs mt-1`,
            { color: isOwn ? 'rgba(255,255,255,0.6)' : Colors.textLight },
            isOwn ? tw`text-right` : tw`text-left`,
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
}
