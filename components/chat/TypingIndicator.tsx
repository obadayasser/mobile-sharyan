import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { MotiView } from 'moti';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

export function TypingIndicator() {
  const { t } = useTranslation();

  return (
    <View style={tw`flex-row items-center px-5 py-2`}>
      <View style={[tw`flex-row items-center gap-1 bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2`]}>
        {[0, 1, 2].map((index) => (
          <MotiView
            key={index}
            from={{ translateY: 0, opacity: 0.3 }}
            animate={{ translateY: -3, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 400,
              delay: index * 150,
              loop: true,
            }}
            style={[tw`w-1.5 h-1.5 rounded-full`, { backgroundColor: Colors.textSecondary }]}
          />
        ))}
      </View>
      <Text style={[tw`text-xs ml-2`, { color: Colors.textLight }]}>{t('chat.typing')}</Text>
    </View>
  );
}
