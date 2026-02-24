import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import {
    addToWatchlist,
    deleteWatchlistItem,
    searchTMDB,
    subscribeToWatchlist,
    toggleWatched,
    WatchlistItem,
} from '../../../src/services/watchlistService';
import { confirmAction } from '../../../src/utils/confirm';

export default function WatchlistScreen() {
    const { user, coupleId } = useAuth();
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [mediaType, setMediaType] = useState<'movie' | 'show'>('movie');
    const [filter, setFilter] = useState<'all' | 'unwatched' | 'watched'>('all');

    useEffect(() => {
        if (!coupleId) return;
        const unsub = subscribeToWatchlist(coupleId, (data) => {
            setItems(data);
            setLoading(false);
        });
        return unsub;
    }, [coupleId]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        const results = await searchTMDB(searchQuery.trim(), mediaType);
        if (results.length > 0) {
            setSearchResults(results);
        } else {
            // No TMDB results — allow manual add
            setSearchResults([{ title: searchQuery.trim(), poster: undefined, rating: undefined, overview: undefined, year: undefined }]);
        }
        setSearching(false);
    };

    const handleAddItem = async (result: any) => {
        if (!coupleId || !user) return;
        await addToWatchlist(
            coupleId,
            result.title,
            mediaType,
            user.uid,
            result.poster,
            result.rating,
            result.overview,
            result.year
        );
        setSearchQuery('');
        setSearchResults([]);
        setShowAdd(false);
    };

    const handleDelete = (item: WatchlistItem) => {
        confirmAction('Remove from Watchlist', `Remove "${item.title}" from watchlist?`, () => {
            deleteWatchlistItem(coupleId!, item.id);
        });
    };

    const filteredItems = items.filter((item) => {
        if (filter === 'unwatched') return !item.watched;
        if (filter === 'watched') return item.watched;
        return true;
    });

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">🎬 Watchlist</Text>
                        <Text className="text-sm text-gray-500 mt-1">
                            {items.filter((i) => !i.watched).length} to watch · {items.filter((i) => i.watched).length} watched
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowAdd(!showAdd)}
                        className="bg-indigo-600 rounded-xl px-3 py-2"
                    >
                        <Text className="text-white font-semibold">{showAdd ? '✕' : '+ Add'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <View className="flex-row mt-3">
                    {(['all', 'unwatched', 'watched'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            className={`mr-2 px-3 py-1 rounded-full ${filter === f ? 'bg-indigo-100' : 'bg-gray-100'
                                }`}
                        >
                            <Text className={`text-sm ${filter === f ? 'text-indigo-600 font-semibold' : 'text-gray-500'
                                }`}>
                                {f === 'all' ? 'All' : f === 'unwatched' ? '📺 To Watch' : '✅ Watched'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Add Section */}
            {showAdd && (
                <View className="bg-white dark:bg-slate-800 mx-4 mt-4 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                    {/* Media Type Toggle */}
                    <View className="flex-row mb-3">
                        <TouchableOpacity
                            onPress={() => setMediaType('movie')}
                            className={`flex-1 py-2 rounded-l-xl items-center ${mediaType === 'movie' ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-slate-700'
                                }`}
                        >
                            <Text className={mediaType === 'movie' ? 'text-white font-semibold' : 'text-gray-600 dark:text-slate-400'}>
                                🎬 Movie
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setMediaType('show')}
                            className={`flex-1 py-2 rounded-r-xl items-center ${mediaType === 'show' ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-slate-700'
                                }`}
                        >
                            <Text className={mediaType === 'show' ? 'text-white font-semibold' : 'text-gray-600 dark:text-slate-400'}>
                                📺 TV Show
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row">
                        <TextInput
                            className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base mr-2 text-gray-900 dark:text-white"
                            placeholder="Search movies or shows..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity
                            onPress={handleSearch}
                            className="bg-indigo-600 rounded-xl px-4 justify-center"
                        >
                            <Text className="text-white font-bold">🔍</Text>
                        </TouchableOpacity>
                    </View>

                    {searching && <ActivityIndicator className="mt-3" color="#4F46E5" />}

                    {/* Search Results */}
                    {searchResults.map((result, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleAddItem(result)}
                            className="flex-row items-center bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 mt-2"
                        >
                            {result.poster ? (
                                <Image
                                    source={{ uri: result.poster }}
                                    className="w-12 h-16 rounded-lg mr-3"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-12 h-16 rounded-lg bg-gray-200 dark:bg-slate-600 mr-3 items-center justify-center">
                                    <Text className="text-xl">🎬</Text>
                                </View>
                            )}
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-900 dark:text-white">{result.title}</Text>
                                <Text className="text-xs text-gray-400 dark:text-slate-400">
                                    {result.year && `${result.year} · `}
                                    {result.rating ? `⭐ ${result.rating.toFixed(1)}` : 'Tap to add'}
                                </Text>
                            </View>
                            <Text className="text-indigo-500 text-sm font-semibold">+ Add</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Watchlist Items */}
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => toggleWatched(coupleId!, item.id, item.watched)}
                        onLongPress={() => handleDelete(item)}
                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 flex-row border border-gray-100 dark:border-slate-700 ${item.watched ? 'opacity-60' : ''
                            }`}
                    >
                        {item.poster ? (
                            <Image
                                source={{ uri: item.poster }}
                                className="w-14 h-20 rounded-xl mr-4"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-14 h-20 rounded-xl bg-gray-100 dark:bg-slate-700 mr-4 items-center justify-center">
                                <Text className="text-2xl">{item.type === 'movie' ? '🎬' : '📺'}</Text>
                            </View>
                        )}
                        <View className="flex-1 justify-center">
                            <Text className={`text-base font-semibold ${item.watched ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white'
                                }`}>
                                {item.title}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                {item.year && <Text className="text-xs text-gray-400 mr-2">{item.year}</Text>}
                                {item.rating && (
                                    <Text className="text-xs text-amber-500">⭐ {item.rating.toFixed(1)}</Text>
                                )}
                            </View>
                            <Text className="text-xs text-gray-300 mt-1">
                                {item.type === 'movie' ? '🎬 Movie' : '📺 Show'} · Tap to {item.watched ? 'unmark' : 'mark watched'}
                            </Text>
                        </View>
                        <View className="justify-center">
                            <Text className="text-2xl">{item.watched ? '✅' : '⬜'}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <Text className="text-5xl mb-4">🎬</Text>
                        <Text className="text-gray-400 dark:text-slate-500 text-center">
                            Your watchlist is empty.{'\n'}Add movies or shows to watch together!
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
