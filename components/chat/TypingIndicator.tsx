import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { MotiView } from 'moti';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

export default function TypingIndicator() {
  const { t } = useTranslation();

  return (
    <View style={tw`flex-row items-center px-4 py-2`}>
      <View style={tw`flex-row items-center gap-1`}>
        {[0, 1, 2].map((index) => (
          <MotiView
            key={index}
            from={{ translateY: 0, opacity: 0.4 }}
            animate={{ translateY: -4, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 400,
              delay: index * 150,
              loop: true,
            }}
            style={[tw`w-2 h-2 rounded-full`, { backgroundColor: Colors.textLight }]}
          />
        ))}
      </View>
      <Text style={[tw`text-xs ml-2`, { color: Colors.textLight }]}>{t('chat.typing')}</Text>
    </View>
  );
}
