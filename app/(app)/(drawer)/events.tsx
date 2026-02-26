import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import CreateEventModal from '../../../src/components/CreateEventModal';
import { useAuth } from '../../../src/context/AuthContext';
import {
    CoupleEvent,
    createEvent,
    deleteEvent,
    getDaysUntil,
    subscribeToEvents,
} from '../../../src/services/eventService';

export default function EventsScreen() {
    const { user, coupleId } = useAuth();
    const [events, setEvents] = useState<CoupleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!coupleId) return;

        const unsubscribe = subscribeToEvents(coupleId, (data) => {
            setEvents(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [coupleId]);

    const handleCreate = async (title: string, date: string, icon: string) => {
        if (!coupleId || !user) return;
        try {
            await createEvent(coupleId, title, date, icon, user.uid);
            setModalVisible(false);
        } catch (e) {
            console.error('Error creating event:', e);
        }
    };

    const handleDelete = (event: CoupleEvent) => {
        if (!coupleId) return;
        Alert.alert(
            'Delete Event',
            `Remove "${event.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteEvent(coupleId, event.id);
                        } catch (e) {
                            console.error('Error deleting event:', e);
                        }
                    },
                },
            ]
        );
    };

    const getCountdownLabel = (dateStr: string) => {
        const days = getDaysUntil(dateStr);
        if (days === 0) return "🎉 Today!";
        if (days === 1) return "Tomorrow!";
        if (days < 0) return `${Math.abs(days)} days ago`;
        return `${days} days away`;
    };

    const getCountdownColor = (dateStr: string) => {
        const days = getDaysUntil(dateStr);
        if (days <= 0) return '#10B981'; // green — today or past
        if (days <= 7) return '#F59E0B'; // amber — this week
        if (days <= 30) return '#3B82F6'; // blue — this month
        return '#6B7280'; // gray — far away
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
            {/* Header */}
            <View className="bg-white dark:bg-slate-900 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Important Dates</Text>
                <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">Countdowns to your special moments</Text>
            </View>

            {events.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-5xl mb-4">📅</Text>
                    <Text className="text-lg font-semibold text-gray-700 dark:text-slate-300 text-center">No events yet</Text>
                    <Text className="text-gray-400 dark:text-slate-500 text-center mt-2">
                        Add your anniversary, birthdays, and special dates!
                    </Text>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="mt-6 bg-indigo-600 dark:bg-primary-600 rounded-xl py-3 px-8"
                    >
                        <Text className="text-white font-semibold text-base">Add First Event</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    renderItem={({ item }) => {
                        const days = getDaysUntil(item.date);
                        return (
                            <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-3 border border-gray-100 dark:border-slate-700">
                                <View className="flex-row items-center">
                                    <View
                                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                                        style={{ backgroundColor: getCountdownColor(item.date) + '20' }}
                                    >
                                        <Text className="text-2xl">{item.icon}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                                        <Text className="text-sm text-gray-400 dark:text-slate-400 mt-0.5">{item.date}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(item)} className="p-1">
                                        <Text className="text-gray-300 dark:text-slate-500 text-lg">✕</Text>
                                    </TouchableOpacity>
                                </View>
                                <View className="mt-3 rounded-xl py-2 px-4 self-start"
                                    style={{ backgroundColor: getCountdownColor(item.date) + '15' }}
                                >
                                    <Text
                                        className="text-sm font-bold"
                                        style={{ color: getCountdownColor(item.date) }}
                                    >
                                        {getCountdownLabel(item.date)}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            {/* Floating Add Button */}
            {events.length > 0 && (
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="absolute bottom-24 right-6 w-14 h-14 bg-indigo-600 dark:bg-primary-500 rounded-full items-center justify-center"
                >
                    <Text className="text-white text-3xl leading-none">+</Text>
                </TouchableOpacity>
            )}

            <CreateEventModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreate={handleCreate}
            />
        </View>
    );
}
