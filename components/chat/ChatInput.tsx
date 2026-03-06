import React, { useState } from 'react';
import { View, TextInput, Pressable, I18nManager } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const isRTL = I18nManager.isRTL;
  const canSend = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View
      style={[
        tw`flex-row items-center px-4 py-2 bg-white`,
        { borderTopWidth: 1, borderTopColor: Colors.border },
      ]}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="..."
        placeholderTextColor={Colors.textLight}
        textAlign={isRTL ? 'right' : 'left'}
        multiline
        style={[tw`flex-1 text-base mr-3 max-h-24`, { color: Colors.text }]}
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={[
          tw`w-10 h-10 rounded-full items-center justify-center`,
          { backgroundColor: canSend ? Colors.primary : Colors.borderLight },
        ]}
      >
        <Ionicons name="send" size={18} color={canSend ? Colors.white : Colors.textLight} />
      </Pressable>
    </View>
  );
}
