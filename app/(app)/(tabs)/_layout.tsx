import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#8b5cf6' : '#6d28d9', // primary-500 : primary-700
        tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b', // slate-400 : slate-500
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff', // slate-800 : white
          borderTopWidth: 1,
          borderTopColor: isDark ? '#334155' : '#e2e8f0', // slate-700 : slate-200
          paddingTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💌</Text>,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Watch',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🎬</Text>,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📓</Text>,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⏳</Text>,
        }}
      />
      <Tabs.Screen
        name="travelmap"
        options={{
          title: 'Travel',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
