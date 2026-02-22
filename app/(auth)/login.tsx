import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/config/firebase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Please enter email and password.');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(app)/(tabs)');
        } catch (err: any) {
            const code = err?.code;
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError(err.message || 'An error occurred during login.');
            }
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

                        {error ? (
                            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-2">
                                <Text className="text-red-700 text-sm text-center">{error}</Text>
                            </View>
                        ) : null}

                        <View className="space-y-4">
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                                <TextInput
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
                                    placeholder="partner@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setError(''); }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                                <TextInput
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setError(''); }}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                className={`w-full bg-indigo-600 rounded-xl py-4 items-center justify-center mt-4 ${loading ? 'opacity-70' : ''}`}
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
