import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
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
import { confirmAction } from '../../../src/utils/confirm';

export default function SettingsScreen() {
    const { user, profile, coupleId } = useAuth();
    const router = useRouter();
    const { request, response, promptAsync } = useGoogleAuth();
    const [googleEmail, setGoogleEmail] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    // Theme setup
    const { colorScheme, setColorScheme } = useColorScheme();

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
    }, [coupleId, response, user]);

    const handleDisconnect = () => {
        confirmAction('Disconnect Calendar', 'Remove Google Calendar connection?', async () => {
            if (coupleId && user) {
                await disconnectGoogle(coupleId, user.uid);
                setGoogleEmail(null);
            }
        });
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
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
            {/* Header */}
            <View className="bg-white dark:bg-slate-900 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Settings</Text>
            </View>

            <View className="p-6">
                {/* Theme Switcher */}
                <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 mb-4">
                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">Theme</Text>
                    <View className="flex-row bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                        {['light', 'dark', 'system'].map((theme) => (
                            <TouchableOpacity
                                key={theme}
                                onPress={() => setColorScheme(theme as any)}
                                style={colorScheme === theme ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
                                className={`flex-1 py-2 items-center rounded-lg ${colorScheme === theme ? 'bg-white dark:bg-slate-600' : ''
                                    }`}
                            >
                                <Text className={`capitalize font-medium ${colorScheme === theme ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'
                                    }`}>
                                    {theme}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Profile Card */}
                <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 mb-4">
                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Account</Text>
                    <Text className="text-base text-gray-900 dark:text-white">{user?.email}</Text>
                </View>

                <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 mb-4">
                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Your Join Code</Text>
                    <Text className="text-xl font-bold text-indigo-600 dark:text-primary-400 tracking-widest">{profile?.joinCode || '------'}</Text>
                </View>

                <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 mb-4">
                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Partner Status</Text>
                    <Text className="text-base text-gray-900 dark:text-white">
                        {profile?.partnerUid ? '💑 Connected' : '⏳ Not linked'}
                    </Text>
                </View>

                {/* Google Calendar Connection */}
                <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 mb-4">
                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                        📅 Google Calendar
                    </Text>
                    {connecting ? (
                        <ActivityIndicator size="small" color="#8b5cf6" />
                    ) : googleEmail ? (
                        <View>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-green-600 dark:text-green-400 text-sm mr-2">✅ Connected</Text>
                                <Text className="text-gray-500 dark:text-slate-400 text-sm">{googleEmail}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleDisconnect}
                                className="bg-gray-50 dark:bg-slate-700 rounded-xl py-2 items-center"
                            >
                                <Text className="text-red-500 dark:text-red-400 text-sm">Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => promptAsync()}
                            disabled={!request}
                            className="bg-indigo-600 dark:bg-indigo-500 rounded-xl flex-row justify-center py-3 items-center"
                        >
                            <Text className="text-white font-semibold text-center">Connect Google Calendar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(127, 29, 29, 0.2)' : '#fef2f2', borderColor: colorScheme === 'dark' ? 'rgba(153, 27, 27, 0.5)' : '#fecaca' }}
                    className="border rounded-2xl py-4 items-center mt-4"
                >
                    <Text className="text-red-600 dark:text-red-400 font-semibold">Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
