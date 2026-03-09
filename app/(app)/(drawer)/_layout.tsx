import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpaceSwitcher from '../../../src/components/SpaceSwitcher';
import { useAuth } from '../../../src/context/AuthContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { startLiveLocationTracking, stopLiveLocationTracking } from '../../../src/services/locationService';

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      {/* Fixed bottom section: My Spaces */}
      <View className="border-t border-gray-200 dark:border-slate-700 px-4" style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 12 }}>
        <TouchableOpacity
          onPress={() => {
            // Close drawer first, then navigate
            props.navigation.closeDrawer();
            // @ts-ignore — Expo Router types may be stale for new files
            router.push('/(app)/space-hub');
          }}
          className="flex-row items-center py-3 px-2 rounded-lg"
        >
          <Text style={{ fontSize: 20 }}>🌌</Text>
          <Text className="text-base font-medium text-gray-700 dark:text-slate-300 ml-4">
            My Spaces
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { spaces, activeSpaceId, user, profile } = useAuth();
  const { customization } = useTheme();
  const { theme, tabNames } = customization;

  useEffect(() => {
    if (user && activeSpaceId && profile?.liveLocationEnabled) {
      startLiveLocationTracking(activeSpaceId, user.uid);
    } else if (user && activeSpaceId) {
      stopLiveLocationTracking(activeSpaceId, user.uid);
    }

    // Cleanup on unmount
    return () => {
      if (user && activeSpaceId) {
        stopLiveLocationTracking(activeSpaceId, user.uid);
      } else {
        stopLiveLocationTracking();
      }
    };
  }, [user, activeSpaceId, profile?.liveLocationEnabled]);

  // Dynamic label: "Date Night" for partner spaces, "Fun Time" for friends/squad
  const activeSpace = spaces.find((s: { id: string; type: string }) => s.id === activeSpaceId);
  const dateNightLabel = tabNames?.['datenight'] || (activeSpace?.type === 'partner' || !activeSpace ? 'Date Night' : 'Fun Time');

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
        drawerStyle: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
        },
        headerStyle: {
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          shadowOpacity: 0,
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#334155' : '#e2e8f0',
        },
        headerTintColor: isDark ? '#f8fafc' : '#0f172a',
        headerRight: () => (
          <View style={{ marginRight: 14 }}>
            <SpaceSwitcher />
          </View>
        ),
      }}>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Drawer.Screen
        name="datenight"
        options={{
          title: dateNightLabel,
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎲</Text>,
        }}
      />
      <Drawer.Screen
        name="travelmap"
        options={{
          title: 'Travel Map',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
        }}
      />
      <Drawer.Screen
        name="lists"
        options={{
          title: tabNames?.['lists'] || 'Lists',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📝</Text>,
        }}
      />
      <Drawer.Screen
        name="gifts"
        options={{
          title: 'Gifts',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎁</Text>,
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          title: 'Events',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⏳</Text>,
        }}
      />
      <Drawer.Screen
        name="notes"
        options={{
          title: tabNames?.['notes'] || 'Chats',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💬</Text>,
        }}
      />
      <Drawer.Screen
        name="diary"
        options={{
          title: 'Diary',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📓</Text>,
        }}
      />
      <Drawer.Screen
        name="quests"
        options={{
          title: 'Quests',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚔️</Text>,
        }}
      />
      <Drawer.Screen
        name="bingo"
        options={{
          title: 'Flashbang Bingo',
          drawerIcon: ({ color }) => (
            <Image
              source={require('../../../assets/images/icon-bingo.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Drawer.Screen
        name="album"
        options={{
          title: tabNames?.['album'] || 'Our Album',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🖼️</Text>,
        }}
      />
      <Drawer.Screen
        name="music"
        options={{
          title: tabNames?.['music'] || 'Our Music',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎵</Text>,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Drawer>
  );
}

