import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { BADGE_CATALOG, subscribeToAchievements, UnlockedBadge } from '../../src/services/achievementService';

export default function TrophyCaseScreen() {
    const { user, coupleId } = useAuth();
    const router = useRouter();
    const [unlocked, setUnlocked] = useState<UnlockedBadge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!coupleId || !user) return;

        const unsubscribe = subscribeToAchievements(coupleId, user.uid, (badges) => {
            setUnlocked(badges);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [coupleId, user]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const unlockedIds = new Set(unlocked.map(b => b.badgeId));

    return (
        <View className="flex-1 bg-secondary">
            <Stack.Screen
                options={{
                    title: 'Trophy Case',
                    headerStyle: { backgroundColor: '#f8fafc' },
                    headerTintColor: '#0f172a',
                    headerShadowVisible: false,
                }}
            />

            <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="mb-8 items-center">
                    <Text className="text-5xl mb-2">🏆</Text>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                        Your Achievements
                    </Text>
                    <Text className="text-gray-500 dark:text-slate-400 text-center mt-2">
                        {unlocked.length} of {BADGE_CATALOG.length} badges earned
                    </Text>
                </View>

                {/* Grid */}
                <View className="flex-row flex-wrap justify-between">
                    {BADGE_CATALOG.map((badge) => {
                        const isUnlocked = unlockedIds.has(badge.id);

                        return (
                            <View
                                key={badge.id}
                                className={`w-[48%] bg-secondary rounded-2xl p-4 mb-4 border ${isUnlocked
                                    ? 'border-primary-100 dark:border-primary-900/50 shadow-sm'
                                    : 'border-dashed border-gray-200 dark:border-slate-700 opacity-60'
                                    }`}
                            >
                                <View className={`w-12 h-12 rounded-full mb-3 items-center justify-center ${isUnlocked ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-secondary/50'
                                    }`}>
                                    <Text className={`text-2xl ${!isUnlocked && 'opacity-30 grayscale'}`}>
                                        {badge.icon}
                                    </Text>
                                </View>

                                <Text className={`font-bold text-base mb-1 ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'
                                    }`}>
                                    {badge.title}
                                </Text>

                                <Text className="text-xs text-gray-500 dark:text-slate-400 leading-tight">
                                    {isUnlocked ? badge.description : 'Locked'}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
