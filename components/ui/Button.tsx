import React from 'react';
import { Pressable, ActivityIndicator, ViewStyle } from 'react-native';
import tw from 'twrnc';
import { Colors } from '@/constants/theme';
import { Text, View } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; textColor: string }> = {
  primary: {
    container: { backgroundColor: Colors.primary },
    textColor: Colors.white,
  },
  secondary: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
    textColor: Colors.primary,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    textColor: Colors.primary,
  },
  danger: {
    container: { backgroundColor: Colors.primaryDark },
    textColor: Colors.white,
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        tw`rounded-xl py-3.5 px-6 flex-row items-center justify-center`,
        styles.container,
        fullWidth && tw`w-full`,
        isDisabled && { opacity: 0.5 },
        pressed && !isDisabled && { opacity: 0.7 },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={styles.textColor} />
      ) : (
        <View style={tw`flex-row items-center gap-2`}>
          {icon && icon}
          <Text style={[tw`font-bold text-base text-center`, { color: styles.textColor }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
