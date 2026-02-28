import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import QuoteLoadingOverlay from '../../../src/components/QuoteLoadingOverlay';
import { useAuth } from '../../../src/context/AuthContext';
import {
    createDiaryEntry,
    deleteDiaryEntry,
    DiaryEntry,
    subscribeToDiary,
    uploadDiaryPhoto,
} from '../../../src/services/diaryService';

export default function DiaryScreen() {
    const { user, coupleId } = useAuth();
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    const [newText, setNewText] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!coupleId) return;

        const unsubscribe = subscribeToDiary(coupleId, (data) => {
            setEntries(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [coupleId]);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Please allow access to your photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.7,
            selectionLimit: 4,
        });

        if (!result.canceled) {
            const uris = result.assets.map((a) => a.uri);
            setSelectedPhotos((prev) => [...prev, ...uris].slice(0, 4));
        }
    };

    const handleSubmit = async () => {
        if (!newText.trim() || !coupleId || !user) return;
        setSubmitting(true);
        try {
            // Upload photos first
            const photoUrls: string[] = [];
            for (const photo of selectedPhotos) {
                const url = await uploadDiaryPhoto(coupleId, photo);
                photoUrls.push(url);
            }

            await createDiaryEntry(coupleId, newText.trim(), photoUrls, user.uid);
            setNewText('');
            setSelectedPhotos([]);
            setComposing(false);
        } catch (e) {
            console.error('Error creating diary entry:', e);
            Alert.alert('Error', 'Failed to save entry. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (entry: DiaryEntry) => {
        if (!coupleId) return;
        Alert.alert('Delete Entry', 'Remove this diary entry?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteDiaryEntry(coupleId, entry.id),
            },
        ]);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const d = timestamp.toDate();
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-50 dark:bg-slate-900"
        >
            {/* Header */}
            <View className="bg-white dark:bg-slate-900 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Our Diary</Text>
                        <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">Shared moments & memories</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setComposing(!composing)}
                        className="bg-indigo-600 rounded-xl px-4 py-2"
                    >
                        <Text className="text-white font-semibold">{composing ? 'Cancel' : '✏️ Write'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Compose Area */}
            {composing && (
                <View className="bg-white dark:bg-slate-800 mx-4 mt-2 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700">
                    <TextInput
                        className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white min-h-[80px]"
                        placeholder="What's on your mind? ✨"
                        placeholderTextColor="#9CA3AF"
                        value={newText}
                        onChangeText={setNewText}
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Selected Photos */}
                    {selectedPhotos.length > 0 && (
                        <ScrollView horizontal className="mt-3" showsHorizontalScrollIndicator={false}>
                            {selectedPhotos.map((uri, i) => (
                                <View key={i} className="mr-2 relative">
                                    <Image
                                        source={{ uri }}
                                        className="w-20 h-20 rounded-xl"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setSelectedPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                                    >
                                        <Text className="text-white text-xs">✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <View className="flex-row items-center mt-3 justify-between">
                        <TouchableOpacity
                            onPress={pickImage}
                            className="flex-row items-center bg-gray-100 dark:bg-slate-700 rounded-xl px-4 py-2"
                            disabled={selectedPhotos.length >= 4}
                        >
                            <Text className="text-base mr-1">📷</Text>
                            <Text className="text-gray-600 dark:text-slate-300 text-sm">
                                {selectedPhotos.length > 0 ? `${selectedPhotos.length}/4` : 'Add Photos'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={!newText.trim() || submitting}
                            className={`rounded-xl px-6 py-2 ${!newText.trim() || submitting ? 'bg-gray-300 dark:bg-slate-600' : 'bg-indigo-600'}`}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-semibold">Post</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {entries.length === 0 && !composing ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-5xl mb-4">📓</Text>
                    <Text className="text-lg font-semibold text-gray-700 dark:text-slate-300 text-center">No entries yet</Text>
                    <Text className="text-gray-400 dark:text-slate-500 text-center mt-2">
                        Start your shared diary — write about your day, save memories together!
                    </Text>
                    <TouchableOpacity
                        onPress={() => setComposing(true)}
                        className="mt-6 bg-indigo-600 rounded-xl py-3 px-8"
                    >
                        <Text className="text-white font-semibold text-base">Write First Entry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-3 border border-gray-100 dark:border-slate-700">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full items-center justify-center mr-2">
                                        <Text className="text-xs">
                                            {item.authorUid === user?.uid ? '💭' : '💝'}
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-gray-400 dark:text-slate-400">
                                        {item.authorUid === user?.uid ? 'You' : 'Partner'} · {formatDate(item.createdAt)}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(item)} className="p-1">
                                    <Text className="text-gray-300 dark:text-slate-500">✕</Text>
                                </TouchableOpacity>
                            </View>
                            <Text className="text-base text-gray-900 dark:text-white leading-6">{item.text}</Text>
                            {item.photos && item.photos.length > 0 && (
                                <ScrollView horizontal className="mt-3" showsHorizontalScrollIndicator={false}>
                                    {item.photos.map((photoUrl, i) => (
                                        <Image
                                            key={i}
                                            source={{ uri: photoUrl }}
                                            className="w-32 h-32 rounded-xl mr-2"
                                            resizeMode="cover"
                                        />
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    )}
                />
            )}

            <QuoteLoadingOverlay visible={submitting} />
        </KeyboardAvoidingView>
    );
}
