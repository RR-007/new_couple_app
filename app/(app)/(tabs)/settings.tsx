import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../../src/config/firebase';
import { useAuth } from '../../../src/context/AuthContext';

export default function SettingsScreen() {
    const { user, profile } = useAuth();
    const router = useRouter();

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
