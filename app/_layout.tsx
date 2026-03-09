import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { ThemeProvider } from '../src/context/ThemeContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import BadgeUnlockToast from '../src/components/BadgeUnlockToast';
import { AuthProvider } from '../src/context/AuthContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { resolvedColorScheme } = useColorScheme();
  const isDark = resolvedColorScheme === 'dark';

  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // We map the native navigation theme components over here so we can decouple our ThemeProvider
  // The default DarkTheme/DefaultTheme are imported from '@react-navigation/native' but we import them at point of use.
  const { DarkTheme, DefaultTheme } = require('@react-navigation/native');

  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <View style={{ flex: 1 }} className={isDark ? "dark" : ""}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <BadgeUnlockToast />
            <StatusBar style={isDark ? "light" : "dark"} />
          </View>
        </NavigationThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
