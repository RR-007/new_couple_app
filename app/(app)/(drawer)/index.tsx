import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PicOfTheDay from '../../../src/components/PicOfTheDay';
import QuestBoard from '../../../src/components/QuestBoard';
import { useAuth } from '../../../src/context/AuthContext';
import { CoupleEvent, getDaysUntil, subscribeToEvents } from '../../../src/services/eventService';
import {
    logMood,
    MoodEntry,
    MOODS,
    subscribeToTodaysMoods,
} from '../../../src/services/moodService';

export default function HomeDashboard() {
    const { user, coupleId } = useAuth();
    const router = useRouter();
    const [nextEvent, setNextEvent] = useState<CoupleEvent | null>(null);
    const [todayMoods, setTodayMoods] = useState<MoodEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!coupleId) return;

        const unsubEvents = subscribeToEvents(coupleId, (events) => {
            const upcoming = events
                .filter((e) => getDaysUntil(e.date) >= 0)
                .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
            setNextEvent(upcoming.length > 0 ? upcoming[0] : null);
            setLoading(false);
        });

        const unsubMoods = subscribeToTodaysMoods(coupleId, (moods) => {
            setTodayMoods(moods);
        });

        return () => {
            unsubEvents();
            unsubMoods();
        };
    }, [coupleId]);

    const myMood = todayMoods.find((m) => m.uid === user?.uid);
    const partnerMood = todayMoods.find((m) => m.uid !== user?.uid);

    const handleMoodSelect = async (mood: string) => {
        if (!coupleId || !user) return;
        try {
            await logMood(coupleId, mood, user.uid);
        } catch (e) {
            console.error('Error logging mood:', e);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">

            {/* Mood Check-In Widget */}
            <View className="mx-4 mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">How are you feeling today?</Text>
                <View className="flex-row justify-between mb-3">
                    {MOODS.map((mood) => (
                        <TouchableOpacity
                            key={mood}
                            onPress={() => handleMoodSelect(mood)}
                            className={`w-12 h-12 rounded-full items-center justify-center ${myMood?.mood === mood ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-primary-500' : 'bg-gray-50 dark:bg-slate-700'
                                }`}
                        >
                            <Text className="text-2xl">{mood}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {!!(myMood || partnerMood) && (
                    <View className="flex-row items-center pt-2 border-t border-gray-50 dark:border-slate-700">
                        {!!myMood && myMood.mood && (
                            <View className="flex-row items-center mr-4">
                                <Text className="text-xs text-gray-400 dark:text-slate-500 mr-1">You:</Text>
                                <Text className="text-lg">{myMood.mood}</Text>
                            </View>
                        )}
                        {!!partnerMood && partnerMood.mood && (
                            <View className="flex-row items-center">
                                <Text className="text-xs text-gray-400 dark:text-slate-500 mr-1">Partner:</Text>
                                <Text className="text-lg">{partnerMood.mood}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Countdown Widget */}
            {!!nextEvent && (
                <TouchableOpacity
                    onPress={() => router.push('/(app)/(drawer)/events')}
                    className="mx-4 mt-3 rounded-2xl p-4 flex-row items-center bg-indigo-50 dark:bg-indigo-900"
                >
                    <Text className="text-3xl mr-3">{nextEvent.icon}</Text>
                    <View className="flex-1">
                        <Text className="text-sm text-indigo-700 dark:text-primary-300 font-medium">{nextEvent.title}</Text>
                        <Text className="text-xs text-indigo-500 dark:text-primary-400 mt-0.5">{nextEvent.date}</Text>
                    </View>
                    <View className="bg-indigo-600 dark:bg-primary-600 rounded-xl px-3 py-2 items-center">
                        <Text className="text-white text-lg font-bold">
                            {getDaysUntil(nextEvent.date)}
                        </Text>
                        <Text className="text-indigo-200 dark:text-primary-200 text-xs">days</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Pic of the Day Widget */}
            <View className="mx-4 mt-3">
                <PicOfTheDay />
            </View>

            {/* Daily & Weekly Quests */}
            <QuestBoard />



            {/* Bottom Padding */}
            <View className="h-24" />
        </ScrollView>
    );
}
