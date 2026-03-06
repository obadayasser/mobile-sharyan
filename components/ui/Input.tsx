import React from 'react';
import { View, Text, TextInput, I18nManager, KeyboardTypeOptions } from 'react-native';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  editable?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType,
  multiline = false,
  editable = true,
}: InputProps) {
  const isRTL = I18nManager.isRTL;

  return (
    <View style={tw`mb-4`}>
      {label && (
        <Text
          style={[
            tw`text-sm font-medium mb-1.5`,
            { color: Colors.text, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        textAlign={isRTL ? 'right' : 'left'}
        style={[
          tw`rounded-xl border py-3 px-4 text-base`,
          {
            color: Colors.text,
            backgroundColor: Colors.surface,
            borderColor: error ? Colors.error : Colors.border,
          },
          multiline && tw`min-h-[100px]`,
          !editable && { opacity: 0.6 },
        ]}
      />
      {error && (
        <Text
          style={[
            tw`text-xs mt-1`,
            { color: Colors.error, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
