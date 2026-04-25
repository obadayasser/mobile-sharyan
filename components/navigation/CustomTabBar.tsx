import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

const CENTER_DIAMETER = 60;
const BAR_HEIGHT = 58;
const FLOAT_GAP = 6;

type TabSlot =
  | { kind: 'route'; name: string; iconName: string; iconLib: 'mat' | 'ion'; labelKey: string }
  | { kind: 'action'; iconName: string; iconLib: 'mat' | 'ion'; labelKey: string; onPress: 'settings' };

const SLOTS: TabSlot[] = [
  { kind: 'route', name: 'index',    iconLib: 'mat', iconName: 'bloodtype',                 labelKey: 'tabs.home' },
  { kind: 'route', name: 'requests', iconLib: 'mat', iconName: 'local-fire-department',     labelKey: 'tabs.requests' },
  { kind: 'route', name: 'chat',     iconLib: 'ion', iconName: 'chatbubble-ellipses-outline', labelKey: 'tabs.chat' },
  { kind: 'action', iconLib: 'ion',  iconName: 'menu',                                       labelKey: 'tabs.more', onPress: 'settings' },
];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const bottomPad = Math.max(insets.bottom, 8);

  const profileRoute = state.routes.find((r) => r.name === 'profile');
  const profileIndex = profileRoute
    ? state.routes.findIndex((r) => r.key === profileRoute.key)
    : -1;
  const isProfileFocused = state.index === profileIndex;

  const fireHaptic = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navigateToTab = (routeName: string) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const index = state.routes.findIndex((r) => r.key === route.key);
    const isFocused = state.index === index;
    fireHaptic();
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  const renderIcon = (lib: 'mat' | 'ion', name: string, color: string, size = 24) =>
    lib === 'mat' ? (
      <MaterialIcons name={name as any} size={size} color={color} />
    ) : (
      <Ionicons name={name as any} size={size} color={color} />
    );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: bottomPad }]}
    >
      <View style={styles.bar}>
        {SLOTS.map((slot, i) => {
          if (slot.kind === 'action') {
            return (
              <Pressable
                key={`action-${i}`}
                onPress={() => {
                  fireHaptic();
                  if (slot.onPress === 'settings') router.push('/settings');
                }}
                android_ripple={{ color: Colors.borderLight, borderless: true }}
                style={styles.slot}
              >
                {renderIcon(slot.iconLib, slot.iconName, Colors.tabIconDefault)}
                <Text
                  numberOfLines={1}
                  style={[styles.label, { color: Colors.tabIconDefault }]}
                >
                  {t(slot.labelKey)}
                </Text>
              </Pressable>
            );
          }

          // route slot
          const route = state.routes.find((r) => r.name === slot.name);
          if (!route) return null;
          const index = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === index;
          const color = isFocused ? Colors.primary : Colors.tabIconDefault;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigateToTab(slot.name)}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              android_ripple={{ color: Colors.borderLight, borderless: true }}
              style={styles.slot}
            >
              {renderIcon(slot.iconLib, slot.iconName, color)}
              <Text numberOfLines={1} style={[styles.label, { color }]}>
                {t(slot.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.centerFloat, { bottom: bottomPad + BAR_HEIGHT - CENTER_DIAMETER / 2 + 8 }]}
      >
        <Pressable
          onPress={() => navigateToTab('profile')}
          android_ripple={{
            color: Colors.primaryLight,
            radius: CENTER_DIAMETER / 2,
            borderless: true,
          }}
          style={({ pressed }) => [
            styles.centerCircle,
            isProfileFocused && styles.centerCircleActive,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Ionicons
            name={isProfileFocused ? 'person' : 'person-outline'}
            size={28}
            color={isProfileFocused ? Colors.primary : Colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    overflow: 'visible',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 6,
    height: BAR_HEIGHT,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      
    }),
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
    paddingTop: 4,
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  centerFloat: {
    position: 'absolute',
    left: '50%',
    marginLeft: -CENTER_DIAMETER / 2,
    width: CENTER_DIAMETER,
    height: CENTER_DIAMETER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: CENTER_DIAMETER,
    height: CENTER_DIAMETER,
    borderRadius: CENTER_DIAMETER / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 14,
      },
    }),
  },
  centerCircleActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
});
