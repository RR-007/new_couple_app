import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import {
    addTravelPin,
    deleteTravelPin,
    geocodeSearch,
    subscribeToPins,
    togglePinVisited,
    TravelPin,
} from '../../../src/services/travelPinService';

export default function TravelMapScreen() {
    const { user, coupleId } = useAuth();
    const [pins, setPins] = useState<TravelPin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lon: number }[]>([]);
    const [searching, setSearching] = useState(false);
    const [filter, setFilter] = useState<'all' | 'bucket' | 'visited'>('all');

    useEffect(() => {
        if (!coupleId) return;
        const unsub = subscribeToPins(coupleId, (data) => {
            setPins(data);
            setLoading(false);
        });
        return unsub;
    }, [coupleId]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        const results = await geocodeSearch(searchQuery.trim());
        if (results.length > 0) {
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
        setSearching(false);
    };

    const handleAddPin = async (result: { name: string; lat: number; lon: number }) => {
        if (!coupleId || !user) return;
        await addTravelPin(coupleId, result.name, result.lat, result.lon, user.uid);
        setSearchQuery('');
        setSearchResults([]);
        setShowAdd(false);
    };

    const handleDelete = (pin: TravelPin) => {
        if (typeof window !== 'undefined') {
            if (window.confirm(`Remove "${pin.name}"?`)) {
                deleteTravelPin(coupleId!, pin.id);
            }
        }
    };

    const filteredPins = pins.filter((pin) => {
        if (filter === 'bucket') return !pin.visited;
        if (filter === 'visited') return pin.visited;
        return true;
    });

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
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
                        <Text className="text-2xl font-bold text-gray-900">🗺️ Travel Map</Text>
                        <Text className="text-sm text-gray-500 mt-1">
                            📍 {pins.filter((p) => !p.visited).length} bucket list · ✅ {pins.filter((p) => p.visited).length} visited
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowAdd(!showAdd)}
                        className="bg-indigo-600 rounded-xl px-3 py-2"
                    >
                        <Text className="text-white font-semibold">{showAdd ? '✕' : '+ Pin'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter */}
                <View className="flex-row mt-3">
                    {(['all', 'bucket', 'visited'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            className={`mr-2 px-3 py-1 rounded-full ${filter === f ? 'bg-indigo-100' : 'bg-gray-100'
                                }`}
                        >
                            <Text className={`text-sm ${filter === f ? 'text-indigo-600 font-semibold' : 'text-gray-500'
                                }`}>
                                {f === 'all' ? 'All' : f === 'bucket' ? '📍 Bucket List' : '✅ Visited'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Add Section */}
            {showAdd && (
                <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Search a place</Text>
                    <View className="flex-row">
                        <TextInput
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mr-2"
                            placeholder="Paris, Tokyo, Bali..."
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

                    {searchResults.map((result, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleAddPin(result)}
                            className="bg-gray-50 rounded-xl p-3 mt-2 flex-row items-center"
                        >
                            <Text className="text-2xl mr-3">📍</Text>
                            <View className="flex-1">
                                <Text className="text-sm text-gray-800" numberOfLines={2}>{result.name}</Text>
                                <Text className="text-xs text-gray-400">
                                    {result.lat.toFixed(2)}, {result.lon.toFixed(2)}
                                </Text>
                            </View>
                            <Text className="text-indigo-500 text-sm font-semibold">+ Add</Text>
                        </TouchableOpacity>
                    ))}
                    {!searching && searchResults.length === 0 && searchQuery.trim() && (
                        <Text className="text-gray-400 text-sm mt-2 text-center">
                            No results found. Try a different search.
                        </Text>
                    )}
                </View>
            )}

            {/* Pins List */}
            <FlatList
                data={filteredPins}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => togglePinVisited(coupleId!, item.id, item.visited)}
                        onLongPress={() => handleDelete(item)}
                        className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 ${item.visited ? 'opacity-60' : ''
                            }`}
                    >
                        <Text className="text-3xl mr-4">{item.visited ? '✅' : '📍'}</Text>
                        <View className="flex-1">
                            <Text className={`text-base font-semibold ${item.visited ? 'line-through text-gray-400' : 'text-gray-900'
                                }`} numberOfLines={2}>
                                {item.name}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                                {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                                {item.note ? ` · ${item.note}` : ''}
                            </Text>
                            <Text className="text-xs text-gray-300 mt-1">
                                Tap to {item.visited ? 'unmark' : 'mark visited'} · Long-press to delete
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <Text className="text-5xl mb-4">🗺️</Text>
                        <Text className="text-gray-400 text-center">
                            No places pinned yet.{'\n'}Add places you want to visit together!
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
