import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/config/firebase';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Auth Context will redirect, but we explicitly push to the link flow
            router.replace('/(app)/link');
        } catch (error: any) {
            Alert.alert('Registration Error', error.message || 'An error occurred during registration');
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
                            <Text className="text-4xl font-bold text-gray-900 mb-2">Create Account</Text>
                            <Text className="text-gray-500 text-base">Start sharing moments together</Text>
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

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Confirm Password</Text>
                                <TextInput
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-indigo-500 focus:bg-white"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={loading}
                                className={`w-full bg-indigo-600 rounded-xl py-4 items-center justify-center mt-4 ${loading ? 'opacity-70' : 'active:bg-indigo-700'}`}
                            >
                                <Text className="text-white font-semibold text-lg">
                                    {loading ? 'Creating account...' : 'Sign Up'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center justify-center mt-8 space-x-1">
                            <Text className="text-gray-600">Already have an account?</Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text className="text-indigo-600 font-semibold p-1">Log in</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
