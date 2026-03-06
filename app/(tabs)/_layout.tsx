import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useNotificationCount } from '@/store/NotificationContext';
import { HapticTab } from '@/components/haptic-tab';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();
  const { unreadCount } = useNotificationCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute', borderTopWidth: 0, elevation: 0, height: 88, paddingBottom: 28 },
          default: { height: 64, paddingBottom: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
        }),
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="bloodtype" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: t('tabs.requests'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="list-alt" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.search'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('tabs.notifications'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="notifications" size={size} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.primary, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
