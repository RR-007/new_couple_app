import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image, ScrollView, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
    addToWatchlist,
    deleteWatchlistItem,
    searchMedia,
    subscribeToWatchlist,
    toggleWatched,
    WatchlistItem,
} from '../../src/services/watchlistService';
import { confirmAction } from '../../src/utils/confirm';

// We already imported useRouter
import { useRouter } from 'expo-router';

export default function WatchlistScreen() {
    const router = useRouter();
    const { user, coupleId } = useAuth();
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [mediaType, setMediaType] = useState<'movie' | 'show'>('movie');
    const [filter, setFilter] = useState<'all' | 'unwatched' | 'watched'>('all');
    const [tagsText, setTagsText] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [tagSearchQuery, setTagSearchQuery] = useState('');

    const allTags = Array.from(new Set(items.flatMap((i) => i.tags || []))).sort();
    const filteredTags = allTags.filter(t => t.toLowerCase().includes(tagSearchQuery.toLowerCase()));

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
        const results = await searchMedia(searchQuery.trim(), mediaType);
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
            result.year,
            tagsText.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
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
        if (filter === 'unwatched' && item.watched) return false;
        if (filter === 'watched' && !item.watched) return false;
        if (activeTag && !(item.tags && item.tags.includes(activeTag))) return false;
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
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
            {/* Header */}
            <View className="bg-white dark:bg-slate-900 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.replace('/(app)/(drawer)/lists')} className="mr-3">
                            <Text className="text-indigo-600 dark:text-indigo-400 text-lg">←</Text>
                        </TouchableOpacity>
                        <View>
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white">🎬 Watchlist</Text>
                            <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                {items.filter((i) => !i.watched).length} to watch · {items.filter((i) => i.watched).length} watched
                            </Text>
                        </View>
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
                            className={`mr-2 px-3 py-1 rounded-full ${filter === f ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-slate-800'
                                }`}
                        >
                            <Text className={`text-sm ${filter === f ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500 dark:text-slate-400'
                                }`}>
                                {f === 'all' ? 'All' : f === 'unwatched' ? '📺 To Watch' : '✅ Watched'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tag Filters */}
                {allTags.length > 0 && !showAdd && (
                    <View className="mt-3">
                        <TextInput
                            placeholder="🔍 Search tags to filter list..."
                            placeholderTextColor="#9CA3AF"
                            value={tagSearchQuery}
                            onChangeText={setTagSearchQuery}
                            className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white mb-2"
                        />
                        {(tagSearchQuery.length > 0 || activeTag) && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                                <TouchableOpacity
                                    onPress={() => { setActiveTag(null); setTagSearchQuery(''); }}
                                    className={`mr-2 px-3 py-1 rounded-full ${!activeTag ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-800'}`}
                                >
                                    <Text className={`text-sm ${!activeTag ? 'text-white font-semibold' : 'text-gray-500 dark:text-slate-400'}`}>Clear Filter</Text>
                                </TouchableOpacity>
                                {filteredTags.map((tag) => (
                                    <TouchableOpacity
                                        key={tag}
                                        onPress={() => setActiveTag(tag)}
                                        className={`mr-2 px-3 py-1 rounded-full w-auto ${activeTag === tag ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-800'}`}
                                    >
                                        <Text className={`text-sm ${activeTag === tag ? 'text-white font-semibold' : 'text-gray-500 dark:text-slate-400'}`}>#{tag}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}
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

                    <View className="mb-3">
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                            placeholder="Tags to apply (comma separated)..."
                            placeholderTextColor="#9CA3AF"
                            value={tagsText}
                            onChangeText={setTagsText}
                        />
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
                            className="flex-row items-center bg-gray-50 dark:bg-slate-700 rounded-xl p-3 mt-2"
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
                        style={{ opacity: item.watched ? 0.6 : 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 flex-row border border-gray-100 dark:border-slate-700"
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
                            {item.tags && item.tags.length > 0 && (
                                <View className="flex-row flex-wrap mt-2">
                                    {item.tags.map((tag, i) => (
                                        <View key={i} className="bg-indigo-100 dark:bg-indigo-900 rounded-full px-2 py-0.5 mr-1 mb-1">
                                            <Text className="text-[10px] text-indigo-700 dark:text-indigo-300">#{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
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
