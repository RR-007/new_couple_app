import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function AppLayout() {
    const { user, loading, profile, activeSpaceId } = useAuth();
    const segments = useSegments();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    // Check if we're already on the space hub to avoid redirect loop
    const onHubScreen = segments.includes('space-hub' as never);

    // If user has no active space and is not already on the hub screen, redirect there
    if (profile && !activeSpaceId && !onHubScreen) {
        // @ts-ignore - Expo router types might not have regenerated yet for the new file
        return <Redirect href="/(app)/space-hub" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(drawer)" />
            <Stack.Screen name="space-hub" />
            <Stack.Screen
                name="space-settings"
                options={{
                    headerShown: true,
                    title: 'Space Settings',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="space-personalization"
                options={{
                    headerShown: true,
                    title: 'Personalization & Theme',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen name="list/[id]" />
            <Stack.Screen name="datenight" />
            <Stack.Screen name="recipes" />
        </Stack>
    );
}
