import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function AppLayout() {
    const { user, loading, profile } = useAuth();
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

    // Check if we're already on the link screen to avoid redirect loop
    const onLinkScreen = segments.includes('link' as never);

    // If user is not linked and NOT already on link screen, redirect there
    if (profile && !profile.partnerUid && !onLinkScreen) {
        return <Redirect href="/(app)/link" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="link" />
            <Stack.Screen name="list/[id]" />
            <Stack.Screen name="datenight" />
            <Stack.Screen name="recipes" />
        </Stack>
    );
}
