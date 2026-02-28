import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Linking,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import TravelMapView from '../../../src/components/TravelMapView';
import { useAuth } from '../../../src/context/AuthContext';
import {
    addTravelPin,
    deleteTravelPin,
    geocodeSearch,
    subscribeToPins,
    togglePinVisited,
    TravelPin,
} from '../../../src/services/travelPinService';
import { confirmAction } from '../../../src/utils/confirm';

export default function TravelMapScreen() {
    const { user, coupleId } = useAuth();
    const [pins, setPins] = useState<TravelPin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lon: number }[]>([]);
    const [searching, setSearching] = useState(false);
    const [filter, setFilter] = useState<'all' | 'bucket' | 'visited'>('all');
    const [showMap, setShowMap] = useState(true);

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
        setSearchResults(results.length > 0 ? results : []);
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
        confirmAction('Remove Pin', `Remove "${pin.name}"?`, () => {
            deleteTravelPin(coupleId!, pin.id);
        });
    };

    const openInGoogleMaps = (pin: TravelPin) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${pin.latitude},${pin.longitude}`;
        Linking.openURL(url);
    };

    const filteredPins = pins.filter((pin) => {
        if (filter === 'bucket') return !pin.visited;
        if (filter === 'visited') return pin.visited;
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
                    <View>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">🗺️ Travel Map</Text>
                        <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            📍 {pins.filter((p) => !p.visited).length} bucket list · ✅ {pins.filter((p) => p.visited).length} visited
                        </Text>
                    </View>
                    <View className="flex-row">
                        <TouchableOpacity
                            onPress={() => setShowMap(!showMap)}
                            className={`rounded-xl px-3 py-2 mr-2 ${showMap ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-slate-700'}`}
                        >
                            <Text className="font-semibold">{showMap ? '🗺️' : '📋'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowAdd(!showAdd)}
                            className="bg-indigo-600 dark:bg-indigo-500 rounded-xl px-3 py-2"
                        >
                            <Text className="text-white font-semibold">{showAdd ? '✕' : '+ Pin'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Filter */}
                <View className="flex-row mt-3">
                    {(['all', 'bucket', 'visited'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            className={`mr-2 px-3 py-1 rounded-full ${filter === f ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-slate-700'
                                }`}
                        >
                            <Text className={`text-sm ${filter === f ? 'text-indigo-600 dark:text-indigo-300 font-semibold' : 'text-gray-500 dark:text-slate-400'
                                }`}>
                                {f === 'all' ? 'All' : f === 'bucket' ? '📍 Bucket List' : '✅ Visited'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Add Section */}
            {showAdd && (
                <View className="bg-white dark:bg-slate-900 mx-4 mt-4 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
                    <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Search a place</Text>
                    <View className="flex-row">
                        <TextInput
                            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base mr-2 text-gray-900 dark:text-white"
                            placeholder="Paris, Tokyo, Bali..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity
                            onPress={handleSearch}
                            className="bg-indigo-600 dark:bg-indigo-500 rounded-xl px-4 justify-center"
                        >
                            <Text className="text-white font-bold">🔍</Text>
                        </TouchableOpacity>
                    </View>

                    {searching && <ActivityIndicator className="mt-3" color="#4F46E5" />}

                    {searchResults.map((result, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleAddPin(result)}
                            className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 mt-2 flex-row items-center"
                        >
                            <Text className="text-2xl mr-3">📍</Text>
                            <View className="flex-1">
                                <Text className="text-sm text-gray-800 dark:text-white" numberOfLines={2}>{result.name}</Text>
                                <Text className="text-xs text-gray-400 dark:text-slate-500">
                                    {result.lat.toFixed(2)}, {result.lon.toFixed(2)}
                                </Text>
                            </View>
                            <Text className="text-indigo-500 dark:text-indigo-300 text-sm font-semibold">+ Add</Text>
                        </TouchableOpacity>
                    ))}
                    {!searching && searchResults.length === 0 && searchQuery.trim() && (
                        <Text className="text-gray-400 dark:text-slate-500 text-sm mt-2 text-center">
                            No results found. Try a different search.
                        </Text>
                    )}
                </View>
            )}

            {/* Interactive Map */}
            {showMap && pins.length > 0 && (
                <View className="mx-4 mt-4">
                    <TravelMapView pins={filteredPins} height={280} />
                </View>
            )}

            {/* Pins List */}
            <FlatList
                data={filteredPins}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View className={`bg-white dark:bg-slate-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-slate-800 ${item.visited ? 'opacity-60' : ''
                        }`}>
                        <TouchableOpacity
                            onPress={() => togglePinVisited(coupleId!, item.id, item.visited)}
                            onLongPress={() => handleDelete(item)}
                            className="flex-row items-center"
                        >
                            <Text className="text-3xl mr-4">{item.visited ? '✅' : '📍'}</Text>
                            <View className="flex-1">
                                <Text className={`text-base font-semibold ${item.visited ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'
                                    }`} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text className="text-xs text-gray-400 mt-1">
                                    {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {/* Google Maps Link */}
                        <View className="flex-row mt-2 ml-12">
                            <TouchableOpacity
                                onPress={() => openInGoogleMaps(item)}
                                className="bg-blue-50 rounded-lg px-3 py-1 mr-2"
                            >
                                <Text className="text-xs text-blue-600 font-medium">📍 Open in Google Maps ↗</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => togglePinVisited(coupleId!, item.id, item.visited)}
                                className="bg-gray-50 rounded-lg px-3 py-1 mr-2"
                            >
                                <Text className="text-xs text-gray-500">
                                    {item.visited ? '⬜ Unmark' : '✅ Mark visited'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDelete(item)}
                                className="bg-red-50 rounded-lg px-3 py-1"
                            >
                                <Text className="text-xs text-red-400">🗑️ Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
