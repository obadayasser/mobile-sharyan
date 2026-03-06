import React, { useState } from 'react';
import { View, TextInput, Pressable, I18nManager } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
}

export function ChatInput({ onSend, onTyping }: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const isRTL = I18nManager.isRTL;
  const canSend = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  const handleChange = (val: string) => {
    setText(val);
    if (val.trim().length > 0) onTyping?.();
  };

  return (
    <View
      style={[
        tw`flex-row items-end px-3 py-2 bg-white`,
        { borderTopWidth: 1, borderTopColor: Colors.border },
      ]}
    >
      <View style={tw`flex-1 bg-gray-100 rounded-2xl px-4 py-2 mr-2`}>
        <TextInput
          value={text}
          onChangeText={handleChange}
          placeholder={t('chat.typeMessage')}
          placeholderTextColor={Colors.textLight}
          textAlign={isRTL ? 'right' : 'left'}
          multiline
          style={[
            tw`text-base max-h-24`,
            { color: Colors.text, lineHeight: 22, paddingTop: 0, paddingBottom: 0 },
          ]}
        />
      </View>
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={({ pressed }) => [
          tw`w-11 h-11 rounded-full items-center justify-center mb-0.5`,
          { backgroundColor: canSend ? Colors.primary : Colors.borderLight },
          pressed && canSend && { opacity: 0.7 },
        ]}
      >
        <Ionicons
          name="send"
          size={20}
          color={canSend ? Colors.white : Colors.textLight}
          style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
        />
      </Pressable>
    </View>
  );
}
