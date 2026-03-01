import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../src/config/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { linkWithPartner, UserProfile } from '../../src/services/coupleService';

export default function LinkScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [partnerCode, setPartnerCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!user) return;

        // Real-time listener — automatically detects when partner links with us
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as UserProfile;
                setProfile(data);
                setLoading(false);

                if (data.partnerUid) {
                    // We've been linked! Navigate to dashboard
                    router.replace('/(app)/(drawer)');
                }
            } else {
                setLoading(false);
            }
        }, (error) => {
            console.error("Error listening to profile:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleLink = async () => {
        if (!partnerCode.trim() || partnerCode.length !== 6) {
            Alert.alert("Invalid Code", "Please enter a valid 6-character partner code.");
            return;
        }

        if (!user) return;

        setLinking(true);
        try {
            await linkWithPartner(user.uid, partnerCode.trim().toUpperCase());
            // Smoothly transition without an alert blocking the UI
            router.replace('/(app)/(drawer)');
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to link with partner. Please check the code and try again.");
        } finally {
            setLinking(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-slate-900">
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white dark:bg-slate-900"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 justify-center px-8 relative">
                    {/* Logout Button */}
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "Logout",
                                "Are you sure you want to log out?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Logout", style: "destructive", onPress: () => signOut(auth) }
                                ]
                            );
                        }}
                        className="absolute top-12 right-2 p-4 z-10"
                    >
                        <Ionicons name="log-out-outline" size={28} color="#64748b" />
                    </TouchableOpacity>

                    <View className="items-center mb-10 mt-12">
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                            Welcome aboard!
                        </Text>
                        <Text className="text-base text-gray-500 dark:text-slate-400 text-center">
                            To get started, you need to connect your account with your partner's.
                        </Text>
                    </View>

                    <View className="bg-indigo-50 dark:bg-primary-900 rounded-xl p-6 mb-8 border border-indigo-100 dark:border-primary-800">
                        <Text className="text-sm font-medium text-indigo-800 dark:text-primary-300 text-center mb-2 uppercase tracking-wide">
                            Your Join Code
                        </Text>
                        <Text className="text-4xl font-bold text-indigo-600 dark:text-primary-400 text-center tracking-widest">
                            {profile?.joinCode || "------"}
                        </Text>
                        <Text className="text-xs text-indigo-600 dark:text-primary-400 text-center mt-3">
                            Share this code with your partner if they are setting up their account.
                        </Text>
                    </View>

                    <View className="relative flex-row items-center mb-8">
                        <View className="flex-1 border-t border-gray-200 dark:border-slate-700" />
                        <Text className="mx-4 text-gray-400 dark:text-slate-500 font-medium text-sm">Or enter their code</Text>
                        <View className="flex-1 border-t border-gray-200 dark:border-slate-700" />
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Partner's Code
                        </Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-4 text-center text-xl font-bold tracking-widest uppercase"
                            placeholder="000000"
                            placeholderTextColor="#94a3b8"
                            value={partnerCode}
                            onChangeText={setPartnerCode}
                            maxLength={6}
                            autoCapitalize="characters"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLink}
                        disabled={linking || partnerCode.length !== 6}
                        className={`w-full py-4 rounded-xl items-center ${linking || partnerCode.length !== 6 ? 'bg-indigo-300 dark:bg-primary-800' : 'bg-indigo-600 dark:bg-primary-600'
                            }`}
                    >
                        {linking ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                Connect Accounts
                            </Text>
                        )}
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
