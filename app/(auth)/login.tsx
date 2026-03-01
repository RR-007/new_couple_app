import { Link, useRouter } from 'expo-router';
import { getAdditionalUserInfo, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/config/firebase';
import { createUserProfile } from '../../src/services/coupleService';
import { saveGoogleToken, useGoogleAuth } from '../../src/services/googleAuthService';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const { request: googleRequest, response: googleResponse, promptAsync: promptGoogle } = useGoogleAuth();

    useEffect(() => {
        if (googleResponse?.type === 'success') {
            const { id_token, access_token, expires_in } = googleResponse.params;
            if (id_token && access_token) {
                handleGoogleAuth(id_token, access_token, Number(expires_in) || 3599);
            } else {
                setError('Google Auth failed. Missing tokens.');
            }
        } else if (googleResponse?.type === 'error') {
            setError(googleResponse.error?.message || 'Google Auth error.');
        }
    }, [googleResponse]);

    const handleGoogleAuth = async (idToken: string, accessToken: string, expiresIn: number) => {
        setLoading(true);
        setError('');
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);

            const isNew = getAdditionalUserInfo(userCredential)?.isNewUser;
            if (isNew) {
                await createUserProfile(userCredential.user.uid, userCredential.user.email);
            }

            // Auto-link Calendar by saving the token (coupleId is null for new users typically, or we just rely on migrating it later)
            await saveGoogleToken(
                null,
                userCredential.user.uid,
                accessToken,
                expiresIn,
                userCredential.user.email || ''
            );

            router.replace('/');
        } catch (err: any) {
            setError(err.message || 'Google Sign-in failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Please enter email and password.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Check for email verification
            if (!userCredential.user.emailVerified) {
                // We should sign them out until they verify
                await auth.signOut();
                setError('Please verify your email before logging in. Check your inbox.');
                setLoading(false);
                return;
            }

            router.replace('/');
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
            className="flex-1 bg-white dark:bg-slate-900"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 justify-center items-center px-6 bg-slate-50 dark:bg-slate-900">
                    <View className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-8">
                        <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 text-center tracking-tight">
                            Welcome to Us
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">
                            Sign in to connect with your partner
                        </Text>

                        {!!error && <Text className="text-red-500 mb-4 text-center font-medium">{error}</Text>}

                        <View className="space-y-4">
                            <View>
                                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email</Text>
                                <TextInput
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setError(''); }}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</Text>
                                <TextInput
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setError(''); }}
                                    placeholder="••••••••"
                                    placeholderTextColor="#94a3b8"
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

                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            <Text className="text-slate-400 dark:text-slate-500 mx-4 font-medium">OR</Text>
                            <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        </View>

                        <TouchableOpacity
                            onPress={() => promptGoogle()}
                            disabled={!googleRequest || loading}
                            className={`w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl py-4 items-center justify-center flex-row space-x-2 ${(!googleRequest || loading) ? 'opacity-70' : ''}`}
                        >
                            <Text className="text-lg">🌐</Text>
                            <Text className="text-slate-700 dark:text-white font-semibold text-lg ml-2">
                                Sign in with Google
                            </Text>
                        </TouchableOpacity>

                        <View className="mt-8 flex-row justify-center items-center">
                            <Text className="text-slate-600 dark:text-slate-400">Don't have an account? </Text>
                            <Link href="/register" asChild>
                                <TouchableOpacity>
                                    <Text className="text-indigo-600 dark:text-indigo-400 font-bold">Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
