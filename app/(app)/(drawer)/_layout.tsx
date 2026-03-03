import { useColorScheme } from '@/hooks/use-color-scheme';
import { Drawer } from 'expo-router/drawer';
import { Image, Text } from 'react-native';

export default function DrawerLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Drawer
      screenOptions={{
        headerShown: true, // We need headers now instead of tabs
        drawerActiveTintColor: isDark ? '#8b5cf6' : '#6d28d9',
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
          title: 'Date Night',
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
          title: 'Lists',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📝</Text>,
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
          title: 'Chats',
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
          title: 'Our Album',
          headerTitle: '',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🖼️</Text>,
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
