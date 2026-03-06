import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { ChatMessage } from '@/types/chat';
import { Colors } from '@/constants/theme';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[tw`mb-2 max-w-[80%]`, isOwn ? tw`self-end` : tw`self-start`]}>
      <View
        style={[
          tw`rounded-2xl px-4 py-2.5`,
          isOwn ? tw`bg-red-600` : tw`bg-gray-100`,
        ]}
      >
        <Text
          style={[
            tw`text-base`,
            { color: isOwn ? Colors.white : Colors.text },
          ]}
        >
          {message.content}
        </Text>
      </View>
      <Text
        style={[
          tw`text-xs mt-1`,
          { color: Colors.textLight },
          isOwn ? tw`text-right` : tw`text-left`,
        ]}
      >
        {time}
      </Text>
    </View>
  );
}
