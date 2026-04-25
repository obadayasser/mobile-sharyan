import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import { MotiView } from 'moti';
import { Colors } from '@/constants/theme';

export function TypingIndicator() {
  return (
    <View style={tw`items-start mb-2`}>
      <View
        style={[
          tw`flex-row items-center px-3.5 py-3 rounded-3xl`,
          {
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.borderLight,
            borderBottomLeftRadius: 4,
            gap: 4,
          },
        ]}
      >
        {[0, 1, 2].map((index) => (
          <MotiView
            key={index}
            from={{ scale: 0.55, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: index * 150,
              loop: true,
              repeatReverse: true,
            }}
            style={[
              tw`w-2 h-2 rounded-full`,
              { backgroundColor: Colors.textLight },
            ]}
          />
        ))}
      </View>
    </View>
  );
}
