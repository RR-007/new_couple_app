import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { getUserProfile, linkWithPartner, UserProfile } from '../../src/services/coupleService';

export default function LinkScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [partnerCode, setPartnerCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const userProfile = await getUserProfile(user.uid);
                if (userProfile) {
                    if (userProfile.partnerUid) {
                        // If they are already linked, go to the main app dashboard
                        router.replace('/(app)/(tabs)');
                    } else {
                        setProfile(userProfile);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
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
            Alert.alert("Success!", "You are now linked with your partner.");
            router.replace('/(app)/(tabs)');
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to link with partner. Please check the code and try again.");
        } finally {
            setLinking(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 justify-center px-8">

                    <View className="items-center mb-10">
                        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            Welcome aboard!
                        </Text>
                        <Text className="text-base text-gray-500 text-center">
                            To get started, you need to connect your account with your partner's.
                        </Text>
                    </View>

                    <View className="bg-indigo-50 rounded-xl p-6 mb-8 border border-indigo-100">
                        <Text className="text-sm font-medium text-indigo-800 text-center mb-2 uppercase tracking-wide">
                            Your Join Code
                        </Text>
                        <Text className="text-4xl font-bold text-indigo-600 text-center tracking-widest">
                            {profile?.joinCode || "------"}
                        </Text>
                        <Text className="text-xs text-indigo-600/70 text-center mt-3">
                            Share this code with your partner if they are setting up their account.
                        </Text>
                    </View>

                    <View className="relative flex-row items-center mb-8">
                        <View className="flex-1 border-t border-gray-200" />
                        <Text className="mx-4 text-gray-400 font-medium text-sm">Or enter their code</Text>
                        <View className="flex-1 border-t border-gray-200" />
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Partner's Code
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-4 text-center text-xl font-bold tracking-widest uppercase"
                            placeholder="000000"
                            placeholderTextColor="#9ca3af"
                            value={partnerCode}
                            onChangeText={setPartnerCode}
                            maxLength={6}
                            autoCapitalize="characters"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLink}
                        disabled={linking || partnerCode.length !== 6}
                        className={`w-full py-4 rounded-xl items-center shadow-sm ${linking || partnerCode.length !== 6 ? 'bg-indigo-300' : 'bg-indigo-600'
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
