import React, { useState } from 'react';
import { View, TextInput, Pressable, I18nManager } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
}

export function ChatInput({ onSend, onTyping }: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
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
        tw`flex-row items-end px-3 pt-2 pb-3`,
        {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
        },
      ]}
    >
      <View
        style={[
          tw`flex-1 flex-row items-end rounded-3xl`,
          {
            backgroundColor: focused ? Colors.surface : '#F3F4F6',
            borderWidth: 1,
            borderColor: focused ? Colors.primary : 'transparent',
            paddingHorizontal: 6,
          },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t('chat.typeMessage')}
          placeholderTextColor={Colors.textLight}
          textAlign={isRTL ? 'right' : 'left'}
          multiline
          style={[
            tw`flex-1 text-[15px] px-3`,
            {
              color: Colors.text,
              paddingTop: 9,
              paddingBottom: 9,
              maxHeight: 110,
            },
          ]}
        />
      </View>

      <MotiView
        animate={{ scale: canSend ? 1 : 0.85, opacity: canSend ? 1 : 0.6 }}
        transition={{ type: 'timing', duration: 160 }}
        style={tw`ml-2`}
      >
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => [
            tw`w-11 h-11 rounded-full items-center justify-center`,
            {
              backgroundColor: canSend ? Colors.primary : Colors.borderLight,
            },
            canSend && {
              shadowColor: Colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            },
            pressed && canSend && { opacity: 0.85 },
          ]}
        >
          <Ionicons
            name="send"
            size={18}
            color={canSend ? Colors.white : Colors.textLight}
            style={[
              { marginLeft: canSend ? 1 : 0 },
              isRTL ? { transform: [{ scaleX: -1 }] } : undefined,
            ]}
          />
        </Pressable>
      </MotiView>
    </View>
  );
}
