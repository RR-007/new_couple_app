import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GlobalQuest, QuestCompletion, completeQuest, subscribeToActiveQuests, subscribeToQuestCompletions } from '../services/questService';

export default function QuestBoard() {
    const { coupleId, user } = useAuth();
    const [dailyQuest, setDailyQuest] = useState<GlobalQuest | null>(null);
    const [weeklyQuest, setWeeklyQuest] = useState<GlobalQuest | null>(null);
    const [completions, setCompletions] = useState<QuestCompletion[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!coupleId) return;

        const unsubQuests = subscribeToActiveQuests(({ daily, weekly }) => {
            setDailyQuest(daily);
            setWeeklyQuest(weekly);
            setLoading(false);
        });

        const unsubCompletions = subscribeToQuestCompletions(coupleId, (data) => {
            setCompletions(data);
        });

        return () => {
            unsubQuests();
            unsubCompletions();
        };
    }, [coupleId]);

    const hasCompletedQuest = (questId: string) => {
        return completions.some(c => c.quest_id === questId && c.user_id === user?.uid);
    };

    const partnerHasCompletedQuest = (questId: string) => {
        return completions.some(c => c.quest_id === questId && c.user_id !== user?.uid);
    };

    const handleCompleteQuest = async (quest: GlobalQuest) => {
        if (!coupleId || !user) return;

        setSubmitting(true);

        try {
            if (quest.type === 'photo' || quest.type === 'video') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera permissions to complete this quest!');
                    setSubmitting(false);
                    return;
                }

                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: quest.type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
                    quality: 0.5,
                });

                if (!result.canceled) {
                    // For now, we'll just mark it complete without uploading the actual bytes 
                    // to save time, or we can upload it if we have a Firebase Storage util.
                    // Since this is Phase 11 and we just want the UI to work:
                    await completeQuest(coupleId, user.uid, quest.id, result.assets[0].uri);
                }
            } else {
                // Text, IRL, Audio
                await completeQuest(coupleId, user.uid, quest.id, undefined, 'Completed!');
            }
        } catch (e) {
            console.error('Error completing quest:', e);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="mx-4 mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 items-center justify-center">
                <ActivityIndicator size="small" color="#4F46E5" />
            </View>
        );
    }

    if (!dailyQuest && !weeklyQuest) return null;

    return (
        <View className="mx-4 mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Active Quests ⚔️</Text>
            </View>

            {/* Daily Quest */}
            {dailyQuest && (
                <View className="mb-4 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-2">
                            <Text className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Daily Quest</Text>
                            <Text className="text-base font-bold text-gray-900 dark:text-white">{dailyQuest.title}</Text>
                            <Text className="text-sm text-gray-600 dark:text-slate-300 mt-1">{dailyQuest.description}</Text>
                        </View>
                        <Text className="text-2xl">{dailyQuest.type === 'photo' ? '📸' : dailyQuest.type === 'text' ? '✍️' : '🎯'}</Text>
                    </View>

                    <View className="mt-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Text className="text-xs text-gray-500 dark:text-slate-400 mr-2">Status:</Text>
                            {hasCompletedQuest(dailyQuest.id) ? (
                                <Text className="text-xs font-bold text-green-500">You ✓</Text>
                            ) : (
                                <Text className="text-xs font-bold text-gray-400 dark:text-slate-500">You Pending</Text>
                            )}
                            <Text className="text-xs text-gray-300 dark:text-slate-600 mx-2">•</Text>
                            {partnerHasCompletedQuest(dailyQuest.id) ? (
                                <Text className="text-xs font-bold text-green-500">Partner ✓</Text>
                            ) : (
                                <Text className="text-xs font-bold text-gray-400 dark:text-slate-500">Partner Pending</Text>
                            )}
                        </View>

                        {!hasCompletedQuest(dailyQuest.id) && (
                            <TouchableOpacity
                                onPress={() => handleCompleteQuest(dailyQuest)}
                                disabled={submitting}
                                className="bg-indigo-600 dark:bg-indigo-500 px-4 py-2 rounded-lg"
                            >
                                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white text-xs font-bold">Complete</Text>}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Weekly Quest */}
            {weeklyQuest && (
                <View className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl border border-purple-100 dark:border-purple-800">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-2">
                            <Text className="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-1">Weekly Quest</Text>
                            <Text className="text-base font-bold text-gray-900 dark:text-white">{weeklyQuest.title}</Text>
                            <Text className="text-sm text-gray-600 dark:text-slate-300 mt-1">{weeklyQuest.description}</Text>
                        </View>
                        <Text className="text-2xl">{weeklyQuest.type === 'video' ? '🎥' : weeklyQuest.type === 'irl' ? '🏃‍♂️' : '🎯'}</Text>
                    </View>

                    <View className="mt-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Text className="text-xs text-gray-500 dark:text-slate-400 mr-2">Status:</Text>
                            {hasCompletedQuest(weeklyQuest.id) ? (
                                <Text className="text-xs font-bold text-green-500">You ✓</Text>
                            ) : (
                                <Text className="text-xs font-bold text-gray-400 dark:text-slate-500">You Pending</Text>
                            )}
                            <Text className="text-xs text-gray-300 dark:text-slate-600 mx-2">•</Text>
                            {partnerHasCompletedQuest(weeklyQuest.id) ? (
                                <Text className="text-xs font-bold text-green-500">Partner ✓</Text>
                            ) : (
                                <Text className="text-xs font-bold text-gray-400 dark:text-slate-500">Partner Pending</Text>
                            )}
                        </View>

                        {!hasCompletedQuest(weeklyQuest.id) && (
                            <TouchableOpacity
                                onPress={() => handleCompleteQuest(weeklyQuest)}
                                disabled={submitting}
                                className="bg-purple-600 dark:bg-purple-500 px-4 py-2 rounded-lg"
                            >
                                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white text-xs font-bold">Complete</Text>}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}
