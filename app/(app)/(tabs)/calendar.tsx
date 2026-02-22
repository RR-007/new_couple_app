import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import {
    CalendarEvent,
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

    const loadEvents = async () => {
        if (!coupleId || !user) return;
        setLoading(true);
        setError(null);

        try {
            let myEvents: CalendarEvent[] = [];
            let partnerEvents: CalendarEvent[] = [];

            // Fetch my events
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

            // Fetch partner events
            if (profile?.partnerUid) {
                const partnerToken = await getPartnerGoogleToken(
                    coupleId,
                    user.uid,
                    profile.partnerUid
                );
                if (partnerToken) {
                    try {
                        const pEvents = await fetchCalendarEvents(partnerToken.accessToken);
                        partnerEvents = pEvents.map((e) => ({ ...e, source: 'partner' as const }));
                    } catch {
                        // Partner token may be expired — we just skip
                    }
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
    };

    useEffect(() => {
        loadEvents();
    }, [coupleId, user]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!connected) {
        return (
            <View className="flex-1 bg-gray-50">
                <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                    <Text className="text-2xl font-bold text-gray-900">📅 Calendar</Text>
                    <Text className="text-sm text-gray-500 mt-1">Both your schedules in one place</Text>
                </View>
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-5xl mb-4">📅</Text>
                    <Text className="text-lg font-semibold text-gray-700 text-center">
                        Connect Your Calendar
                    </Text>
                    <Text className="text-gray-400 text-center mt-2">
                        Go to Settings → Connect Google Calendar to see your merged schedule here.
                    </Text>
                </View>
            </View>
        );
    }

    const renderEvent = (event: CalendarEvent) => (
        <View
            key={event.id}
            className={`bg-white rounded-xl p-4 mb-2 border-l-4 ${event.source === 'you' ? 'border-l-indigo-500' : 'border-l-purple-500'
                }`}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                    <View className="flex-row items-center">
                        {event.isTravel && <Text className="mr-1">✈️</Text>}
                        <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
                            {event.title}
                        </Text>
                    </View>
                    {event.location && (
                        <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
                            📍 {event.location}
                        </Text>
                    )}
                </View>
                <View className="items-end">
                    <Text className="text-sm text-gray-600">
                        {formatTime(event.start, event.allDay)}
                    </Text>
                    <Text className={`text-xs mt-0.5 ${event.source === 'you' ? 'text-indigo-500' : 'text-purple-500'
                        }`}>
                        {event.source === 'you' ? 'You' : 'Partner'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">📅 Calendar</Text>
                        <Text className="text-sm text-gray-500 mt-1">Next 30 days</Text>
                    </View>
                    <TouchableOpacity onPress={loadEvents} className="bg-gray-100 rounded-xl px-3 py-2">
                        <Text className="text-sm text-gray-600">↻ Refresh</Text>
                    </TouchableOpacity>
                </View>
                {/* Legend */}
                <View className="flex-row mt-3">
                    <View className="flex-row items-center mr-4">
                        <View className="w-3 h-3 rounded-full bg-indigo-500 mr-1" />
                        <Text className="text-xs text-gray-500">You</Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                        <View className="w-3 h-3 rounded-full bg-purple-500 mr-1" />
                        <Text className="text-xs text-gray-500">Partner</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-xs mr-1">✈️</Text>
                        <Text className="text-xs text-gray-500">Travel</Text>
                    </View>
                </View>
            </View>

            {error && (
                <View className="mx-4 mt-4 bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <Text className="text-amber-700 text-sm">{error}</Text>
                </View>
            )}

            {days.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-4xl mb-3">📭</Text>
                    <Text className="text-gray-400">No events in the next 30 days</Text>
                </View>
            ) : (
                <FlatList
                    data={days}
                    keyExtractor={(item) => item.date}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    renderItem={({ item: day }) => (
                        <View className="mb-4">
                            <Text className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                {day.label}
                            </Text>
                            {day.events.map(renderEvent)}
                        </View>
                    )}
                />
            )}
        </View>
    );
}
