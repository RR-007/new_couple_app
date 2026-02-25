import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/config/firebase';
import { createUserProfile } from '../../src/services/coupleService';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        setError('');

        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await createUserProfile(userCredential.user.uid, userCredential.user.email);
            router.replace('/(app)/link');
        } catch (err: any) {
            const code = err?.code;
            if (code === 'auth/email-already-in-use') {
                setError('This email is already registered. Try logging in instead.');
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (code === 'auth/weak-password') {
                setError('Password is too weak. Use at least 6 characters.');
            } else {
                setError(err.message || 'An error occurred during registration.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white dark:bg-slate-900"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 items-center justify-center p-8">
                    <View className="w-full max-w-sm space-y-6">
                        <View className="items-center mb-8">
                            <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-2 text-center">Create Account</Text>
                            <Text className="text-gray-500 dark:text-slate-400 text-base text-center">Start sharing moments together</Text>
                        </View>

                        {error ? (
                            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-2">
                                <Text className="text-red-700 text-sm text-center">{error}</Text>
                            </View>
                        ) : null}

                        <View className="space-y-4">
                            <View>
                                <Text className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</Text>
                                <TextInput
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="partner@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setError(''); }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</Text>
                                <TextInput
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setError(''); }}
                                    secureTextEntry
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm Password</Text>
                                <TextInput
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={loading}
                                className={`w-full bg-indigo-600 rounded-xl py-4 items-center justify-center mt-4 ${loading ? 'opacity-70' : ''}`}
                            >
                                <Text className="text-white font-semibold text-lg">
                                    {loading ? 'Creating account...' : 'Sign Up'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center justify-center mt-8 space-x-1">
                            <Text className="text-gray-600 dark:text-gray-400">Already have an account?</Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text className="text-indigo-600 dark:text-indigo-400 font-semibold p-1">Log in</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
