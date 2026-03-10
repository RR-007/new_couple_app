import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { SavedTrack, removeTrack, saveTrack, setSongOfTheDay, subscribeToMusic, subscribeToSongOfTheDay } from '../../../src/services/musicService';
import { SpotifyTrack, searchTracks } from '../../../src/services/spotifyApiService';
import { getSpotifyTokenData } from '../../../src/services/spotifyAuthService';

export default function MusicScreen() {
    const { user, coupleId } = useAuth();
    const router = useRouter();

    const [hasSpotify, setHasSpotify] = useState<boolean | null>(null);
    const [accessToken, setAccessToken] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);

    const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
    const [songOfTheDay, setSongOfTheDayTrack] = useState<SavedTrack | null>(null);

    // Initial check for Spotify connection
    useEffect(() => {
        const checkSpotify = async () => {
            if (!coupleId || !user) return;
            const tokenData = await getSpotifyTokenData(coupleId, user.uid);
            if (tokenData && tokenData.accessToken && Date.now() < tokenData.expiresAt) {
                setHasSpotify(true);
                setAccessToken(tokenData.accessToken);
            } else {
                setHasSpotify(false);
            }
        };
        checkSpotify();
    }, [coupleId, user]);

    // Subscriptions
    useEffect(() => {
        if (!coupleId) return;

        const unsubMusic = subscribeToMusic(coupleId, (tracks) => {
            setSavedTracks(tracks);
        });

        const unsubSotd = subscribeToSongOfTheDay(coupleId, (track) => {
            setSongOfTheDayTrack(track);
        });

        return () => {
            unsubMusic();
            unsubSotd();
        };
    }, [coupleId]);

    const handleSearch = async () => {
        if (!searchQuery.trim() || !accessToken) return;
        setIsSearching(true);
        try {
            const results = await searchTracks(searchQuery, accessToken);
            setSearchResults(results);
        } catch (e) {
            console.error('Search error', e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSaveTrack = async (track: SpotifyTrack) => {
        if (!coupleId || !user) return;
        try {
            await saveTrack(coupleId, track, user.uid);
            setSearchQuery('');
            setSearchResults([]); // clear search after adding
        } catch (e) {
            console.error('Save error', e);
        }
    };

    const handleSetSongOfTheDay = async (track: SpotifyTrack) => {
        if (!coupleId || !user) return;
        try {
            await setSongOfTheDay(coupleId, track, user.uid);
            setSearchQuery('');
            setSearchResults([]); // clear search
        } catch (e) {
            console.error('SOTD error', e);
        }
    };

    const handleRemoveTrack = async (docId: string) => {
        if (!coupleId) return;
        try {
            await removeTrack(coupleId, docId);
        } catch (e) {
            console.error('Remove error', e);
        }
    };

    const renderTrackItem = ({ item }: { item: SavedTrack | SpotifyTrack }) => {
        const isSearchResult = !('docId' in item);

        return (
            <View className="flex-row items-center bg-secondary p-3 rounded-2xl mb-3 border border-secondary-100 dark:border-secondary-100/20 shadow-sm">
                {item.albumArtUrl ? (
                    <Image source={{ uri: item.albumArtUrl }} className="w-14 h-14 rounded-xl mr-3 bg-gray-200" />
                ) : (
                    <View className="w-14 h-14 rounded-xl mr-3 bg-gray-200 dark:bg-slate-700 items-center justify-center">
                        <Ionicons name="musical-notes" size={24} color="#9ca3af" />
                    </View>
                )}
                <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-xs text-gray-500 dark:text-slate-400" numberOfLines={1}>{item.artist}</Text>
                </View>

                {isSearchResult ? (
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => handleSetSongOfTheDay(item)}
                            className="bg-primary-100 dark:bg-primary-900/40 p-2 rounded-lg"
                        >
                            <Ionicons name="star" size={18} color="#6366f1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSaveTrack(item)}
                            className="bg-[#1DB954] p-2 rounded-lg"
                        >
                            <Ionicons name="add" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={() => Linking.openURL(item.spotifyUrl)}>
                            <Ionicons name="play-circle" size={28} color="#1DB954" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleRemoveTrack((item as SavedTrack).docId!)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    if (hasSpotify === null) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary">
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    if (!hasSpotify) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary px-8">
                <FontAwesome name="spotify" size={64} color="#1DB954" className="mb-4" />
                <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Connect Spotify</Text>
                <Text className="text-center text-gray-500 dark:text-slate-400 mb-6">
                    Link your Spotify account to share music and set a Song of the Day!
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(app)/(drawer)/settings')}
                    className="bg-[#1DB954] px-6 py-3 rounded-full"
                >
                    <Text className="text-white font-bold text-base">Go to Settings</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-secondary">
            {/* Header */}
            <View className="bg-transparent pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">🎵 Our Music</Text>
            </View>

            <FlatList
                data={searchResults.length > 0 ? searchResults : savedTracks}
                keyExtractor={(item: any) => item.docId || item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={renderTrackItem}
                ListHeaderComponent={
                    <View className="mb-6">
                        {/* Song of the Day Section */}
                        {songOfTheDay && searchResults.length === 0 && (
                            <View className="mb-6">
                                <Text className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Song of the Day</Text>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => Linking.openURL(songOfTheDay.spotifyUrl)}
                                    className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-3xl p-5 overflow-hidden shadow-md"
                                >
                                    <View className="absolute top-0 right-0 opacity-10 blur-xl w-32 h-32 bg-white rounded-full -mt-10 -mr-10" />
                                    <View className="flex-row items-center">
                                        <Image source={{ uri: songOfTheDay.albumArtUrl }} className="w-20 h-20 rounded-2xl bg-primary-800" />
                                        <View className="flex-1 ml-4 justify-center">
                                            <Text className="text-white font-bold text-lg mb-0.5" numberOfLines={1}>{songOfTheDay.name}</Text>
                                            <Text className="text-primary-100 text-sm mb-2" numberOfLines={1}>{songOfTheDay.artist}</Text>
                                            <View className="flex-row items-center">
                                                <Ionicons name="play" size={16} color="white" />
                                                <Text className="text-white font-medium text-xs ml-1">Play on Spotify</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Search Bar */}
                        <Text className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                            {searchResults.length > 0 ? 'Search Results' : 'Find Music'}
                        </Text>
                        <View className="flex-row items-center bg-secondary rounded-2xl px-4 py-1 border border-gray-200 dark:border-slate-700 shadow-sm mb-2">
                            <Ionicons name="search" size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 h-12 ml-2 text-base text-gray-900 dark:text-white"
                                placeholder="Search Songs..."
                                placeholderTextColor="#9ca3af"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearch}
                                returnKeyType="search"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {isSearching && <ActivityIndicator color="#1DB954" className="mt-4" />}

                        {!isSearching && searchResults.length === 0 && savedTracks.length > 0 && (
                            <Text className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-6 mb-2">
                                Shared Playlist ({savedTracks.length})
                            </Text>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    !isSearching && searchResults.length === 0 ? (
                        <View className="items-center justify-center py-10 opacity-50">
                            <Ionicons name="musical-notes-outline" size={64} color="#9ca3af" />
                            <Text className="text-gray-500 mt-4 text-center">
                                No songs shared yet. Search and add your favorites!
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}
