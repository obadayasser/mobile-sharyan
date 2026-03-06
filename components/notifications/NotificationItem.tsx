import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import { MaterialIcons } from '@expo/vector-icons';
import { Notification } from '@/types/notification';
import { NotificationType } from '@/constants/enums';
import { Colors } from '@/constants/theme';
import { timeAgo } from '@/utils/date';
import i18n from '@/i18n';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

const iconMap: Record<NotificationType, keyof typeof MaterialIcons.glyphMap> = {
  BLOOD_REQUEST: 'bloodtype',
  EMERGENCY_REQUEST: 'emergency',
  DONATION_REMINDER: 'schedule',
  CAMPAIGN_ANNOUNCEMENT: 'campaign',
  SHORTAGE_ALERT: 'warning',
  DONATION_OFFER: 'volunteer-activism',
  CHAT_MESSAGE: 'chat',
  BADGE_EARNED: 'emoji-events',
  POINTS_EARNED: 'stars',
  SYSTEM: 'info',
};

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const isArabic = i18n.language === 'ar';
  const displayTitle = isArabic && notification.titleAr ? notification.titleAr : notification.title;
  const displayBody = isArabic && notification.bodyAr ? notification.bodyAr : notification.body;
  const iconName = iconMap[notification.type] || 'info';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tw`flex-row items-start px-4 py-3`,
        !notification.isRead && { backgroundColor: '#EFF6FF' },
        pressed && { backgroundColor: Colors.borderLight },
      ]}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <View style={tw`w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 mr-2`} />
      )}

      {/* Icon */}
      <View
        style={[
          tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
          { backgroundColor: Colors.primaryLight },
        ]}
      >
        <MaterialIcons name={iconName} size={20} color={Colors.primary} />
      </View>

      {/* Content */}
      <View style={tw`flex-1`}>
        <Text style={[tw`text-sm font-bold`, { color: Colors.text }]} numberOfLines={1}>
          {displayTitle}
        </Text>
        <Text style={[tw`text-sm mt-0.5`, { color: Colors.textSecondary }]} numberOfLines={2}>
          {displayBody}
        </Text>
        <Text style={[tw`text-xs mt-1`, { color: Colors.textLight }]}>
          {timeAgo(notification.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}
