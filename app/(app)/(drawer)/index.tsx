import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CurrentlyListeningWidget from '../../../src/components/CurrentlyListeningWidget';
import PartnerLocationWidget from '../../../src/components/PartnerLocationWidget';
import PicOfTheDay from '../../../src/components/PicOfTheDay';
import QuestBoard from '../../../src/components/QuestBoard';
import { useAuth } from '../../../src/context/AuthContext';
import { CoupleEvent, getDaysUntil, subscribeToEvents } from '../../../src/services/eventService';
import {
    createNote,
    LoveNote,
    subscribeToNotes
} from '../../../src/services/noteService';
import { subscribeToStreak, UserStreak } from '../../../src/services/streakService';
import { formatRelativeTime } from '../../../src/utils/dateFormatter';

export default function HomeDashboard() {
    const { user, coupleId } = useAuth();
    const router = useRouter();
    const [nextEvent, setNextEvent] = useState<CoupleEvent | null>(null);
    const [recentNotes, setRecentNotes] = useState<LoveNote[]>([]);
    const [noteText, setNoteText] = useState('');
    const [submittingNote, setSubmittingNote] = useState(false);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState<UserStreak | null>(null);

    useEffect(() => {
        if (!coupleId) return;

        const unsubEvents = subscribeToEvents(coupleId, (events) => {
            const upcoming = events
                .filter((e) => getDaysUntil(e.date) >= 0)
                .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
            setNextEvent(upcoming.length > 0 ? upcoming[0] : null);
            setLoading(false);
        });

        const unsubNotes = subscribeToNotes(coupleId, (notes) => {
            setRecentNotes(notes.slice(0, 2));
        });

        // Subscribe to streak
        let unsubStreak = () => { };
        if (user) {
            unsubStreak = subscribeToStreak(coupleId, user.uid, (data) => {
                setStreak(data);
            });
        }

        return () => {
            unsubEvents();
            unsubNotes();
            unsubStreak();
        };
    }, [coupleId, user]);

    const handleQuickTextSubmit = async () => {
        if (!noteText.trim() || !coupleId || !user || submittingNote) return;

        setSubmittingNote(true);
        try {
            await createNote(coupleId, noteText.trim(), user.uid);
            setNoteText('');
        } catch (e) {
            console.error('Error posting quick note:', e);
        } finally {
            setSubmittingNote(false);
        }
    };

    const getStreakMessage = (current: number) => {
        if (current >= 100) return "Legendary! 🏆";
        if (current >= 30) return "On fire! 🔥🔥🔥";
        if (current >= 7) return "Unstoppable! 💪";
        if (current >= 3) return "Keep it up! ✨";
        return "Start your streak! 🌟";
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
            {/* Spotify Currently Listening */}
            <CurrentlyListeningWidget />

            {/* Partner Location Widget */}
            <PartnerLocationWidget />

            {/* Streak Widget */}
            <View className="mx-4 mt-4 bg-gradient-to-r rounded-2xl overflow-hidden">
                <View className="bg-orange-50 dark:bg-orange-900/30 rounded-2xl p-4 flex-row items-center border border-orange-200 dark:border-orange-800">
                    <View className="w-14 h-14 bg-orange-500 dark:bg-orange-600 rounded-xl items-center justify-center mr-4">
                        <Text className="text-2xl">🔥</Text>
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-baseline">
                            <Text className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {streak?.currentStreak ?? 0}
                            </Text>
                            <Text className="text-sm text-orange-500 dark:text-orange-400 ml-1 font-medium">day streak</Text>
                        </View>
                        <Text className="text-xs text-orange-400 dark:text-orange-500 mt-0.5">
                            {getStreakMessage(streak?.currentStreak ?? 0)}
                            {streak && streak.longestStreak > 1 ? ` · Best: ${streak.longestStreak} days` : ''}
                        </Text>
                    </View>
                </View>
            </View>
            {/* Quick Text Widget */}
            <View className="mx-4 mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Send a quick chat...</Text>

                <View className="flex-row items-center bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2 border border-gray-100 dark:border-slate-700">
                    <TextInput
                        className="flex-1 text-base text-gray-900 dark:text-white min-h-[40px]"
                        placeholder="Thinking of you..."
                        placeholderTextColor="#9ca3af"
                        value={noteText}
                        onChangeText={setNoteText}
                        multiline
                        maxLength={200}
                    />
                    <TouchableOpacity
                        onPress={handleQuickTextSubmit}
                        disabled={submittingNote || !noteText.trim()}
                        className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${submittingNote || !noteText.trim()
                            ? 'bg-gray-200 dark:bg-slate-700'
                            : 'bg-indigo-600 dark:bg-primary-600'
                            }`}
                    >
                        {submittingNote ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text className="text-white">↑</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Mini-feed */}
                {recentNotes.length > 0 && (
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/(drawer)/notes')}
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700"
                    >
                        <Text className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Recent Messages</Text>
                        {recentNotes.map((note) => {
                            const isMe = note.authorUid === user?.uid;
                            return (
                                <View key={note.id} className="mb-2">
                                    <View className="flex-row items-center mb-1">
                                        <Text className={`text-xs font-medium ${isMe ? 'text-indigo-600 dark:text-primary-400' : 'text-gray-700 dark:text-slate-300'}`}>
                                            {isMe ? 'You' : 'Partner'}
                                        </Text>
                                        <Text className="text-[10px] text-gray-400 dark:text-slate-500 ml-2">
                                            {formatRelativeTime(note.createdAt?.toDate())}
                                        </Text>
                                    </View>
                                    <Text className="text-sm text-gray-600 dark:text-slate-400" numberOfLines={2}>
                                        {note.text}
                                    </Text>
                                </View>
                            );
                        })}
                    </TouchableOpacity>
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
