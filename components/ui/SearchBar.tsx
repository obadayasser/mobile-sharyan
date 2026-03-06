import React from 'react';
import { View, TextInput, Pressable, I18nManager } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilter?: () => void;
}

export default function SearchBar({ value, onChangeText, placeholder, onFilter }: SearchBarProps) {
  const isRTL = I18nManager.isRTL;

  return (
    <View style={tw`flex-row items-center bg-gray-100 rounded-xl px-4 py-3`}>
      <Ionicons
        name="search"
        size={20}
        color={Colors.textSecondary}
        style={tw`${isRTL ? 'ml-2' : 'mr-2'}`}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        textAlign={isRTL ? 'right' : 'left'}
        style={[tw`flex-1 text-base`, { color: Colors.text }]}
      />
      {onFilter && (
        <Pressable onPress={onFilter} style={tw`${isRTL ? 'mr-2' : 'ml-2'}`}>
          <Ionicons name="options-outline" size={22} color={Colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}
