import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import {
    CalendarEvent,
    createCalendarEvent,
    DayGroup,
    fetchCalendarEvents,
    formatTime,
    groupByDate,
    mergeEvents,
} from '../../../src/services/calendarService';
import {
    getGoogleToken,
    getPartnerGoogleToken,
} from '../../../src/services/googleAuthService';

export default function CalendarScreen() {
    const { user, coupleId, profile } = useAuth();
    const [days, setDays] = useState<DayGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');       // YYYY-MM-DD
    const [newStartTime, setNewStartTime] = useState('');  // HH:MM
    const [newEndTime, setNewEndTime] = useState('');      // HH:MM
    const [newLocation, setNewLocation] = useState('');
    const [creating, setCreating] = useState(false);

    const loadEvents = useCallback(async () => {
        if (!coupleId || !user) return;
        setLoading(true);
        setError(null);

        try {
            let myEvents: CalendarEvent[] = [];
            let partnerEvents: CalendarEvent[] = [];

            const myToken = await getGoogleToken(coupleId, user.uid);
            if (myToken) {
                setConnected(true);
                try {
                    myEvents = await fetchCalendarEvents(myToken.accessToken);
                } catch (e: any) {
                    if (e.message?.includes('401')) {
                        setError('Your Google Calendar session expired. Reconnect in Settings.');
                        setConnected(false);
                    }
                }
            }

            if (profile?.partnerUid) {
                const partnerToken = await getPartnerGoogleToken(coupleId, user.uid, profile.partnerUid);
                if (partnerToken) {
                    try {
                        const pEvents = await fetchCalendarEvents(partnerToken.accessToken);
                        partnerEvents = pEvents.map((e) => ({ ...e, source: 'partner' as const }));
                    } catch { }
                }
            }

            const merged = mergeEvents(myEvents, partnerEvents);
            const grouped = groupByDate(merged);
            setDays(grouped);
        } catch (e) {
            console.error('Calendar load error:', e);
            setError('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    }, [coupleId, user, profile?.partnerUid]);

    useFocusEffect(
        useCallback(() => {
            loadEvents();
        }, [loadEvents])
    );

    const handleCreateEvent = async () => {
        if (!newTitle.trim() || !newDate || !newStartTime || !newEndTime || !coupleId || !user) {
            Alert.alert('Missing fields', 'Please fill in title, date, start time, and end time.');
            return;
        }

        setCreating(true);
        try {
            const token = await getGoogleToken(coupleId, user.uid);
            if (!token) {
                Alert.alert('Session expired', 'Please reconnect Google Calendar in Settings.');
                return;
            }

            const startDateTime = `${newDate}T${newStartTime}:00`;
            const endDateTime = `${newDate}T${newEndTime}:00`;

            await createCalendarEvent(
                token.accessToken,
                newTitle.trim(),
                startDateTime,
                endDateTime,
                newLocation.trim() || undefined
            );

            Alert.alert('Created!', `"${newTitle}" added to your Google Calendar.`);
            setShowAddModal(false);
            setNewTitle('');
            setNewDate('');
            setNewStartTime('');
            setNewEndTime('');
            setNewLocation('');
            loadEvents(); // Refresh to show new event
        } catch (e: any) {
            console.error('Create event error:', e);
            Alert.alert('Error', e.message || 'Failed to create event');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!connected) {
        return (
            <View className="flex-1 bg-secondary">
                <View className="bg-transparent py-4 px-6 border-b border-gray-100 dark:border-slate-800">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">📅 Calendar</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">Both your schedules in one place</Text>
                </View>
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-5xl mb-4">📅</Text>
                    <Text className="text-lg font-semibold text-gray-700 dark:text-slate-300 text-center mb-2">
                        Connect Your Calendar
                    </Text>
                    <Text className="text-gray-500 dark:text-slate-400 text-center mb-6">
                        See your merged schedule by connecting Google Calendar.
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            // @ts-ignore
                            import('expo-router').then(({ router }) => router.push('/(app)/(drawer)/settings'));
                        }}
                        className="bg-primary-600 dark:bg-primary-500 rounded-xl px-6 py-3"
                    >
                        <Text className="text-white font-semibold">Go to Settings</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const renderEvent = (event: CalendarEvent) => (
        <View
            key={event.id}
            className={`bg-secondary rounded-xl p-4 mb-2 border-l-4 ${event.source === 'you' ? 'border-l-primary-500' : 'border-l-secondary-500'
                }`}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                    <View className="flex-row items-center">
                        {event.isTravel && <Text className="mr-1">✈️</Text>}
                        <Text className="text-base font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                            {event.title}
                        </Text>
                    </View>
                    {!!event.location && (
                        <Text className="text-xs text-gray-400 dark:text-slate-400 mt-1" numberOfLines={1}>
                            📍 {event.location}
                        </Text>
                    )}
                </View>
                <View className="items-end">
                    <Text className="text-sm text-gray-600 dark:text-slate-400">
                        {formatTime(event.start, event.allDay)}
                    </Text>
                    <Text className={`text-xs mt-0.5 ${event.source === 'you' ? 'text-primary-500 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400'
                        }`}>
                        {event.source === 'you' ? 'You' : 'Partner'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-secondary">
            {/* Header */}
            <View className="bg-transparent py-4 px-6 border-b border-gray-100 dark:border-slate-800">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">📅 Calendar</Text>
                        <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">Next 30 days</Text>
                    </View>
                    <View className="flex-row">
                        <TouchableOpacity
                            onPress={() => setShowAddModal(true)}
                            className="bg-primary-600 dark:bg-primary-600 rounded-xl px-3 py-2 mr-2"
                        >
                            <Text className="text-sm text-white font-semibold">+ Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={loadEvents} className="bg-gray-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                            <Text className="text-sm text-gray-600 dark:text-slate-300">↻</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Legend */}
                <View className="flex-row mt-3">
                    <View className="flex-row items-center mr-4">
                        <View className="w-3 h-3 rounded-full bg-primary-500 mr-1" />
                        <Text className="text-xs text-gray-500 dark:text-slate-400">You</Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                        <View className="w-3 h-3 rounded-full bg-secondary-500 mr-1" />
                        <Text className="text-xs text-gray-500 dark:text-slate-400">Partner</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-xs mr-1">✈️</Text>
                        <Text className="text-xs text-gray-500 dark:text-slate-400">Travel</Text>
                    </View>
                </View>
            </View>

            {!!error && (
                <View className="mx-4 mt-4 bg-amber-50 dark:bg-amber-900 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                    <Text className="text-amber-700 dark:text-amber-400 text-sm">{error}</Text>
                </View>
            )}

            {days.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-4xl mb-3">📭</Text>
                    <Text className="text-gray-400 dark:text-slate-500">No events in the next 30 days</Text>
                </View>
            ) : (
                <FlatList
                    data={days}
                    keyExtractor={(item) => item.date}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    renderItem={({ item: day }) => (
                        <View className="mb-4">
                            <Text className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                {day.label}
                            </Text>
                            {day.events.map(renderEvent)}
                        </View>
                    )}
                />
            )}

            {/* Add Event Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View className="bg-transparent rounded-t-3xl p-6 max-h-[80%] border-t border-slate-800">
                        <View className="flex-row items-center justify-between mb-5">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">Add Calendar Entry</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Text className="text-gray-400 dark:text-slate-500 text-2xl">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Title *</Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base mb-4 text-gray-900 dark:text-white"
                                placeholder="Dinner date, Movie night..."
                                placeholderTextColor="#9CA3AF"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />

                            <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Date * (YYYY-MM-DD)</Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base mb-4 text-gray-900 dark:text-white"
                                placeholder="2026-03-15"
                                placeholderTextColor="#9CA3AF"
                                value={newDate}
                                onChangeText={setNewDate}
                            />

                            <View className="flex-row mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Start * (HH:MM)</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                                        placeholder="19:00"
                                        placeholderTextColor="#9CA3AF"
                                        value={newStartTime}
                                        onChangeText={setNewStartTime}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">End * (HH:MM)</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                                        placeholder="21:00"
                                        placeholderTextColor="#9CA3AF"
                                        value={newEndTime}
                                        onChangeText={setNewEndTime}
                                    />
                                </View>
                            </View>

                            <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Location (optional)</Text>
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base mb-6 text-gray-900 dark:text-white"
                                placeholder="Restaurant name, address..."
                                placeholderTextColor="#9CA3AF"
                                value={newLocation}
                                onChangeText={setNewLocation}
                            />

                            <TouchableOpacity
                                onPress={handleCreateEvent}
                                disabled={creating || !newTitle.trim()}
                                className={`rounded-2xl py-4 items-center mb-4 ${creating || !newTitle.trim() ? 'bg-gray-200 dark:bg-slate-700' : 'bg-primary-600 dark:bg-primary-600'
                                    }`}
                            >
                                <Text className="text-white font-bold text-base">
                                    {creating ? 'Creating...' : '📅 Add to Google Calendar'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
