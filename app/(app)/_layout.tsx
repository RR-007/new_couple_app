import { Redirect, Stack, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { getUserProfile } from '../../src/services/coupleService';

export default function AppLayout() {
    const { user, loading } = useAuth();
    const [checkingLink, setCheckingLink] = useState(true);
    const [isLinked, setIsLinked] = useState(false);
    const segments = useSegments();

    useEffect(() => {
        async function checkLinkStatus() {
            if (user) {
                try {
                    const profile = await getUserProfile(user.uid);
                    setIsLinked(!!profile?.partnerUid);
                } catch (e) {
                    console.error('Error checking link status:', e);
                }
            }
            setCheckingLink(false);
        }

        if (!loading) {
            checkLinkStatus();
        }
    }, [user, loading]);

    if (loading || checkingLink) {
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
    if (!isLinked && !onLinkScreen) {
        return <Redirect href="/(app)/link" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="link" options={{ headerShown: false }} />
        </Stack>
    );
}
