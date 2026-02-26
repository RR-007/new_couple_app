import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import {
    addDateIdea,
    DateIdea,
    deleteDateIdea,
    markDateIdeaDone,
    subscribeToDateIdeas,
} from '../../../src/services/dateIdeaService';

export default function DateNightScreen() {
    const router = useRouter();
    const { user, coupleId } = useAuth();
    const [ideas, setIdeas] = useState<DateIdea[]>([]);
    const [loading, setLoading] = useState(true);
    const [newIdea, setNewIdea] = useState('');
    const [spinning, setSpinning] = useState(false);
    const [picked, setPicked] = useState<DateIdea | null>(null);
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!coupleId) return;

        const unsubscribe = subscribeToDateIdeas(coupleId, (data) => {
            setIdeas(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [coupleId]);

    const handleAdd = async () => {
        if (!newIdea.trim() || !coupleId || !user) return;
        try {
            await addDateIdea(coupleId, newIdea.trim(), user.uid);
            setNewIdea('');
        } catch (e) {
            console.error('Error adding idea:', e);
        }
    };

    const handleSpin = () => {
        const available = ideas.filter((i) => !i.done);
        if (available.length === 0) {
            Alert.alert('No ideas!', 'Add some date ideas first, or unmark completed ones.');
            return;
        }

        setSpinning(true);
        setPicked(null);

        // Animate: rapid cycling through ideas
        let count = 0;
        const totalCycles = 15 + Math.floor(Math.random() * 10);
        const interval = setInterval(() => {
            const randomIdx = Math.floor(Math.random() * available.length);
            setPicked(available[randomIdx]);
            count++;

            if (count >= totalCycles) {
                clearInterval(interval);
                // Final pick
                const finalIdx = Math.floor(Math.random() * available.length);
                setPicked(available[finalIdx]);
                setSpinning(false);

                // Pulse animation
                Animated.sequence([
                    Animated.timing(spinAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                    Animated.timing(spinAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                    Animated.timing(spinAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                    Animated.timing(spinAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                ]).start();
            }
        }, 80 + count * 8); // Gradually slows down
    };

    const handleToggleDone = async (idea: DateIdea) => {
        if (!coupleId) return;
        await markDateIdeaDone(coupleId, idea.id, !idea.done);
    };

    const handleDelete = (idea: DateIdea) => {
        if (!coupleId) return;
        Alert.alert('Remove Idea', `Delete "${idea.text}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteDateIdea(coupleId, idea.id),
            },
        ]);
    };

    const scale = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1],
    });

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const availableCount = ideas.filter((i) => !i.done).length;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">


            {/* Spin Section */}
            <View className="items-center py-6 bg-white dark:bg-slate-800 mx-4 mt-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                {picked && !spinning ? (
                    <Animated.View style={{ transform: [{ scale }] }} className="items-center">
                        <Text className="text-5xl mb-2">🎉</Text>
                        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center px-6">
                            {picked.text}
                        </Text>
                        <Text className="text-sm text-gray-400 dark:text-slate-500 mt-2">Tonight's plan!</Text>
                    </Animated.View>
                ) : spinning && picked ? (
                    <View className="items-center">
                        <Text className="text-4xl mb-2">🎲</Text>
                        <Text className="text-lg font-semibold text-gray-600 dark:text-slate-300 text-center px-6">
                            {picked.text}
                        </Text>
                    </View>
                ) : (
                    <View className="items-center">
                        <Text className="text-4xl mb-2">🎲</Text>
                        <Text className="text-gray-400 dark:text-slate-400 text-center">
                            {availableCount > 0 ? 'Tap spin to pick a date idea!' : 'Add some ideas below first'}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleSpin}
                    disabled={spinning || availableCount === 0}
                    className={`mt-4 rounded-2xl py-3 px-10 ${spinning || availableCount === 0 ? 'bg-gray-200 dark:bg-slate-700' : 'bg-indigo-600'
                        }`}
                >
                    <Text className="text-white font-bold text-base">
                        {spinning ? 'Spinning...' : '🎲 Spin!'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Add Idea */}
            <View className="flex-row mx-4 mt-4">
                <TextInput
                    className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mr-2"
                    placeholder="New date idea..."
                    placeholderTextColor="#9CA3AF"
                    value={newIdea}
                    onChangeText={setNewIdea}
                    onSubmitEditing={handleAdd}
                />
                <TouchableOpacity
                    onPress={handleAdd}
                    disabled={!newIdea.trim()}
                    className={`rounded-xl px-4 py-3 ${!newIdea.trim() ? 'bg-gray-200 dark:bg-slate-700' : 'bg-indigo-600'}`}
                >
                    <Text className="text-white font-semibold">Add</Text>
                </TouchableOpacity>
            </View>

            {/* Ideas List */}
            <FlatList
                data={ideas}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleToggleDone(item)}
                        onLongPress={() => handleDelete(item)}
                        className={`bg-white dark:bg-slate-800 rounded-xl p-4 mb-2 flex-row items-center border ${item.done ? 'border-green-100 dark:border-green-900' : 'border-gray-100 dark:border-slate-700'
                            }`}
                    >
                        <View
                            className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${item.done ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-slate-600'
                                }`}
                        >
                            {item.done && <Text className="text-white text-xs">✓</Text>}
                        </View>
                        <Text
                            className={`flex-1 text-base ${item.done ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-white'
                                }`}
                        >
                            {item.text}
                        </Text>
                        <Text className="text-xs text-gray-300 dark:text-slate-500">
                            {item.addedBy === user?.uid ? 'You' : 'Partner'}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
