import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { useNotificationCount } from '@/store/NotificationContext';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { notificationService } from '@/services/notification.service';
import { Notification } from '@/types/notification';
import { router } from 'expo-router';

export default function NotificationsTab() {
  const { t } = useTranslation();
  const { userType } = useAuth();
  const { refreshCount, resetCount, decrementCount } = useNotificationCount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    if (!userType) return;
    try {
      const res = await notificationService.list({
        userType,
        page: 1,
        limit: 50,
      });
      setNotifications(res.data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userType]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleMarkAllRead = async () => {
    if (!userType) return;
    try {
      await notificationService.markAllRead(userType);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      resetCount();
    } catch {
      // silently handle
    }
  };

  const handlePress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        decrementCount();
      } catch {
        // silently handle
      }
    }
    // Navigate based on notification data
    if (notification.data?.requestId) {
      router.push(`/blood-request/${notification.data.requestId}`);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`} edges={['top']}>
      <View
        style={tw`bg-white px-5 py-4 border-b border-gray-100 flex-row items-center justify-between`}
      >
        <Text style={tw`text-xl font-bold text-gray-900`}>
          {t('notifications.title')}
        </Text>
        {notifications.some((n) => !n.isRead) && (
          <Pressable onPress={handleMarkAllRead}>
            <Text
              style={{
                color: Colors.primary,
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              {t('notifications.markAllRead')}
            </Text>
          </Pressable>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`pb-24`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetch();
              refreshCount();
            }}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handlePress(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-none"
            title={t('notifications.noNotifications')}
          />
        }
      />
    </SafeAreaView>
  );
}
