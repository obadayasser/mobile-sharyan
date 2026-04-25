import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="requests" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="search" />
    </Tabs>
  );
}
