import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '@/types/chat';
import { Colors } from '@/constants/theme';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

const RADIUS_LG = 18;
const RADIUS_SM = 6;
const RADIUS_TAIL = 4;

export function ChatBubble({
  message,
  isOwn,
  isFirstInGroup = true,
  isLastInGroup = true,
}: ChatBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const ownRadius = {
    borderTopLeftRadius: RADIUS_LG,
    borderTopRightRadius: isFirstInGroup ? RADIUS_LG : RADIUS_SM,
    borderBottomLeftRadius: RADIUS_LG,
    borderBottomRightRadius: isLastInGroup ? RADIUS_TAIL : RADIUS_SM,
  };

  const otherRadius = {
    borderTopLeftRadius: isFirstInGroup ? RADIUS_LG : RADIUS_SM,
    borderTopRightRadius: RADIUS_LG,
    borderBottomLeftRadius: isLastInGroup ? RADIUS_TAIL : RADIUS_SM,
    borderBottomRightRadius: RADIUS_LG,
  };

  return (
    <View
      style={[
        isOwn ? tw`items-end` : tw`items-start`,
        isLastInGroup ? tw`mb-2` : tw`mb-0.5`,
      ]}
    >
      <View
        style={[
          tw`px-3.5 py-2`,
          { maxWidth: '78%' },
          isOwn
            ? [
                ownRadius,
                {
                  backgroundColor: Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                },
              ]
            : [
                otherRadius,
                {
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.borderLight,
                },
              ],
        ]}
      >
        <Text
          style={[
            tw`text-[15px] leading-5`,
            { color: isOwn ? Colors.white : Colors.text },
          ]}
        >
          {message.content}
        </Text>

        <View style={tw`flex-row items-center justify-end mt-0.5`}>
          <Text
            style={[
              tw`text-[10px]`,
              {
                color: isOwn
                  ? 'rgba(255,255,255,0.78)'
                  : Colors.textLight,
              },
            ]}
          >
            {time}
          </Text>
          {isOwn && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color="rgba(255,255,255,0.85)"
              style={tw`ml-1`}
            />
          )}
        </View>
      </View>
    </View>
  );
}
