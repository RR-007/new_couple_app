import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';



import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  const { resolvedColorScheme } = useColorScheme();
  const isDark = resolvedColorScheme === 'dark';

  return (
    <AuthProvider>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }} className={isDark ? "dark" : ""}>
          <Stack>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={isDark ? "light" : "dark"} />
        </View>
      </ThemeProvider>
    </AuthProvider>
  );
}
