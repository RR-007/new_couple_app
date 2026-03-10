import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import QuoteLoadingOverlay from '../../../src/components/QuoteLoadingOverlay';
import { useAuth } from '../../../src/context/AuthContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { getCurrentLocation } from '../../../src/services/locationService';
import {
    createNote,
    deleteNote,
    LoveNote,
    subscribeToNotes,
} from '../../../src/services/noteService';

export default function NotesScreen() {
    const { user, coupleId } = useAuth();
    const { getNickname } = useTheme();
    const [notes, setNotes] = useState<LoveNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (!coupleId) return;

        const unsubscribe = subscribeToNotes(coupleId, (data) => {
            setNotes(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [coupleId]);

    const handleSend = async () => {
        if (!text.trim() || !coupleId || !user) return;
        setSending(true);
        try {
            await createNote(coupleId, text.trim(), user.uid);
            setText('');
        } catch (e) {
            console.error('Error sending note:', e);
        } finally {
            setSending(false);
        }
    };

    const handleSendLocation = async () => {
        if (!coupleId || !user) return;
        setSending(true);
        try {
            const location = await getCurrentLocation();
            if (!location) {
                Alert.alert("Permission Denied", "We need location permissions to drop a pin!");
                setSending(false);
                return;
            }

            const { latitude, longitude } = location.coords;
            await createNote(coupleId, "📍 Meet me here!", user.uid, {
                lat: latitude,
                lng: longitude
            });
        } catch (e) {
            console.error('Error sending location:', e);
            Alert.alert("Error", "Could not fetch location.");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = (note: LoveNote) => {
        if (!coupleId) return;
        Alert.alert('Delete Note', 'Remove this note?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteNote(coupleId, note.id),
            },
        ]);
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const d = timestamp.toDate();
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isMe = (uid: string) => uid === user?.uid;

    const openDirections = (lat: number, lng: number) => {
        const url = Platform.select({
            ios: `maps:0,0?q=${lat},${lng}`,
            android: `geo:0,0?q=${lat},${lng}`
        });
        if (url) Linking.openURL(url);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary">
                <ActivityIndicator size="large" color="#EC4899" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-secondary"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            {/* Header */}
            <View className="bg-transparent pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">💬 Chat</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">Chat natively with each other securely</Text>
                </View>
            </View>

            {notes.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-5xl mb-4">💬</Text>
                    <Text className="text-lg font-semibold text-gray-700 dark:text-slate-300 text-center">No messages yet</Text>
                    <Text className="text-gray-400 dark:text-slate-500 text-center mt-2">
                        Send the first chat or drop a pin to start the conversation!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id}
                    inverted={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
                    renderItem={({ item }) => {
                        const mine = isMe(item.authorUid);
                        return (
                            <TouchableOpacity
                                onLongPress={() => mine && handleDelete(item)}
                                activeOpacity={0.8}
                                className={`mb-3 max-w-[80%] ${mine ? 'self-end' : 'self-start'}`}
                            >
                                <View
                                    className={`rounded-2xl px-4 py-3 ${mine
                                        ? 'bg-pink-500 rounded-br-sm'
                                        : 'bg-secondary border border-secondary-100 dark:border-secondary-100/20 rounded-bl-sm'
                                        }`}
                                >
                                    {item.location ? (
                                        <View className="w-56 rounded-lg overflow-hidden">
                                            <Text className={`text-base leading-6 mb-2 font-semibold ${mine ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                {item.text}
                                            </Text>
                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() => openDirections(item.location!.lat, item.location!.lng)}
                                                className="h-32 w-full rounded-lg overflow-hidden relative"
                                            >
                                                <MapView
                                                    style={{ width: '100%', height: '100%' }}
                                                    initialRegion={{
                                                        latitude: item.location.lat,
                                                        longitude: item.location.lng,
                                                        latitudeDelta: 0.005,
                                                        longitudeDelta: 0.005,
                                                    }}
                                                    scrollEnabled={false}
                                                    zoomEnabled={false}
                                                    pitchEnabled={false}
                                                    rotateEnabled={false}
                                                >
                                                    <Marker
                                                        coordinate={{ latitude: item.location.lat, longitude: item.location.lng }}
                                                    />
                                                </MapView>
                                                {/* Overlay to catch taps and open native maps */}
                                                <View className="absolute inset-0 bg-transparent" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => openDirections(item.location!.lat, item.location!.lng)}
                                                className={`mt-2 py-1.5 px-3 rounded-full flex-row items-center justify-center ${mine ? 'bg-pink-600' : 'bg-pink-100 dark:bg-pink-900'}`}
                                            >
                                                <Text className={`text-sm font-medium ${mine ? 'text-white' : 'text-pink-600 dark:text-pink-300'}`}>Get Directions</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Text
                                            className={`text-base leading-6 ${mine ? 'text-white' : 'text-gray-900 dark:text-white'}`}
                                        >
                                            {item.text}
                                        </Text>
                                    )}
                                </View>
                                <Text
                                    className={`text-xs mt-1 text-gray-400 dark:text-slate-500 ${mine ? 'text-right' : 'text-left'
                                        }`}
                                >
                                    {mine ? 'You' : `💕 ${getNickname(item.authorUid) || 'Partner'}`} · {formatTime(item.createdAt)}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            {/* Compose Bar */}
            <View className="bg-transparent px-4 py-3 border-t border-gray-100 dark:border-slate-800 flex-row items-end">
                <TouchableOpacity
                    onPress={handleSendLocation}
                    disabled={sending}
                    className="w-10 h-10 items-center justify-center mr-2 mb-1"
                >
                    <Text className="text-2xl">📍</Text>
                </TouchableOpacity>
                <TextInput
                    ref={inputRef}
                    className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-base text-gray-900 dark:text-white mr-3 max-h-24"
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    value={text}
                    onChangeText={setText}
                    multiline
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!text.trim() || sending}
                    className={`w-10 h-10 rounded-full items-center justify-center mb-1 ${!text.trim() || sending ? 'bg-gray-200 dark:bg-slate-700' : 'bg-pink-500'
                        }`}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="text-white text-lg">↑</Text>
                    )}
                </TouchableOpacity>
            </View>

            <QuoteLoadingOverlay visible={sending && !text.trim()} />
        </KeyboardAvoidingView>
    );
}
