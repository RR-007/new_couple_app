import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../../src/config/firebase';
import { useAuth } from '../../../src/context/AuthContext';
import {
    disconnectGoogle,
    fetchGoogleUserInfo,
    getGoogleToken,
    saveGoogleToken,
    useGoogleAuth,
} from '../../../src/services/googleAuthService';

export default function SettingsScreen() {
    const { user, profile, coupleId } = useAuth();
    const router = useRouter();
    const { request, response, promptAsync } = useGoogleAuth();
    const [googleEmail, setGoogleEmail] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    // Check if already connected
    useEffect(() => {
        const checkToken = async () => {
            if (!coupleId || !user) return;
            const token = await getGoogleToken(coupleId, user.uid);
            if (token) setGoogleEmail(token.email);
        };
        checkToken();
    }, [coupleId, user]);

    // Handle OAuth response
    useEffect(() => {
        const handleResponse = async () => {
            if (response?.type === 'success' && response.authentication) {
                setConnecting(true);
                try {
                    const { accessToken } = response.authentication;
                    const expiresIn = response.authentication.expiresIn || 3600;
                    const userInfo = await fetchGoogleUserInfo(accessToken);

                    if (coupleId && user) {
                        await saveGoogleToken(coupleId, user.uid, accessToken, expiresIn, userInfo.email);
                        setGoogleEmail(userInfo.email);
                        Alert.alert('Connected!', `Google Calendar linked as ${userInfo.email}`);
                    }
                } catch (e) {
                    console.error('Google auth error:', e);
                    Alert.alert('Error', 'Failed to connect Google Calendar');
                } finally {
                    setConnecting(false);
                }
            }
        };
        handleResponse();
    }, [response]);

    const handleDisconnect = () => {
        Alert.alert('Disconnect Calendar', 'Remove Google Calendar connection?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Disconnect',
                style: 'destructive',
                onPress: async () => {
                    if (coupleId && user) {
                        await disconnectGoogle(coupleId, user.uid);
                        setGoogleEmail(null);
                    }
                },
            },
        ]);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Settings</Text>
            </View>

            <View className="p-6">
                {/* Profile Card */}
                <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                    <Text className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Account</Text>
                    <Text className="text-base text-gray-900">{user?.email}</Text>
                </View>

                <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                    <Text className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Your Join Code</Text>
                    <Text className="text-xl font-bold text-indigo-600 tracking-widest">{profile?.joinCode || '------'}</Text>
                </View>

                <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                    <Text className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Partner Status</Text>
                    <Text className="text-base text-gray-900">
                        {profile?.partnerUid ? '💑 Connected' : '⏳ Not linked'}
                    </Text>
                </View>

                {/* Google Calendar Connection */}
                <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                    <Text className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        📅 Google Calendar
                    </Text>
                    {connecting ? (
                        <ActivityIndicator size="small" color="#4F46E5" />
                    ) : googleEmail ? (
                        <View>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-green-600 text-sm mr-2">✅ Connected</Text>
                                <Text className="text-gray-500 text-sm">{googleEmail}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleDisconnect}
                                className="bg-gray-50 rounded-xl py-2 items-center"
                            >
                                <Text className="text-red-500 text-sm">Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => promptAsync()}
                            disabled={!request}
                            className="bg-indigo-600 rounded-xl py-3 items-center"
                        >
                            <Text className="text-white font-semibold">Connect Google Calendar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Sign Out */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 border border-red-200 rounded-2xl py-4 items-center mt-4"
                >
                    <Text className="text-red-600 font-semibold">Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
