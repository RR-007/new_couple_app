import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/config/firebase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Auth context will automatically redirect, but we can also do it manually
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Error', error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 items-center justify-center p-8">
                    <View className="w-full max-w-sm space-y-6">
                        <View className="items-center mb-8">
                            <Text className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</Text>
                            <Text className="text-gray-500 text-base">Sign in to your couple account</Text>
                        </View>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                                <TextInput
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-indigo-500 focus:bg-white"
                                    placeholder="partner@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                                <TextInput
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-indigo-500 focus:bg-white"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                className={`w-full bg-indigo-600 rounded-xl py-4 items-center justify-center mt-4 ${loading ? 'opacity-70' : 'active:bg-indigo-700'}`}
                            >
                                <Text className="text-white font-semibold text-lg">
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center justify-center mt-8 space-x-1">
                            <Text className="text-gray-600">Don't have an account?</Text>
                            <Link href="/(auth)/register" asChild>
                                <TouchableOpacity>
                                    <Text className="text-indigo-600 font-semibold p-1">Sign up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
