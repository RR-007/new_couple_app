import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    View,
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import {
    addListItem,
    deleteList,
    deleteListItem,
    ListItem,
    subscribeToListItems,
    toggleListItem,
} from '../../../src/services/listService';

export default function ListDetailScreen() {
    const { id, name, icon, color } = useLocalSearchParams<{
        id: string;
        name: string;
        icon: string;
        color: string;
    }>();
    const { user, coupleId } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemText, setNewItemText] = useState('');
    const [newItemUrl, setNewItemUrl] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);

    useEffect(() => {
        if (!coupleId || !id) return;

        const unsubscribe = subscribeToListItems(coupleId, id, (data) => {
            setItems(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [coupleId, id]);

    const handleAddItem = async () => {
        if (!newItemText.trim() || !coupleId || !user || !id) return;
        try {
            const url = newItemUrl.trim() || undefined;
            await addListItem(coupleId, id, newItemText.trim(), user.uid, url);
            setNewItemText('');
            setNewItemUrl('');
            setShowUrlInput(false);
        } catch (e) {
            console.error('Error adding item:', e);
        }
    };

    const handleOpenUrl = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                // Try adding https:// if missing
                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                await Linking.openURL(fullUrl);
            }
        } catch (e) {
            console.error('Error opening URL:', e);
        }
    };

    const handleToggle = async (item: ListItem) => {
        if (!coupleId || !id) return;
        try {
            await toggleListItem(coupleId, id, item.id, !item.completed);
        } catch (e) {
            console.error('Error toggling item:', e);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!coupleId || !id) return;
        try {
            await deleteListItem(coupleId, id, itemId);
        } catch (e) {
            console.error('Error deleting item:', e);
        }
    };

    const handleDeleteList = () => {
        if (!coupleId || !id) return;
        Alert.alert(
            'Delete List',
            `Are you sure you want to delete "${name}"? All items will be lost.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteList(coupleId, id);
                            router.back();
                        } catch (e) {
                            console.error('Error deleting list:', e);
                        }
                    },
                },
            ]
        );
    };

    const completedCount = items.filter((i) => i.completed).length;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-50 dark:bg-slate-900"
        >
            {/* Header */}
            <View className="bg-white dark:bg-slate-800 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-700">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Text className="text-2xl text-gray-400 dark:text-slate-400">‹</Text>
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center">
                        <Text className="text-2xl mr-2">{icon || '📝'}</Text>
                        <Text className="text-xl font-bold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
                            {name || 'List'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleDeleteList}>
                        <Text className="text-red-400 dark:text-red-500 text-sm font-medium">Delete</Text>
                    </TouchableOpacity>
                </View>
                {items.length > 0 && (
                    <Text className="text-xs text-gray-400 dark:text-slate-400 mt-2 ml-10">
                        {completedCount}/{items.length} completed
                    </Text>
                )}
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={color || '#4F46E5'} />
                </View>
            ) : items.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-5xl mb-4">{icon || '📝'}</Text>
                    <Text className="text-lg font-semibold text-gray-700 dark:text-slate-300 text-center">No items yet</Text>
                    <Text className="text-gray-400 dark:text-slate-400 text-center mt-2">
                        Add your first item below!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <View className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-2 border border-gray-100 dark:border-slate-700">
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => handleToggle(item)}
                                    className={`w-7 h-7 rounded-lg border-2 items-center justify-center mr-3 ${item.completed
                                        ? 'border-green-500 bg-green-500'
                                        : 'border-gray-300 dark:border-slate-600'
                                        }`}
                                >
                                    {item.completed && (
                                        <Text className="text-white text-xs font-bold">✓</Text>
                                    )}
                                </TouchableOpacity>
                                <Text
                                    className={`flex-1 text-base ${item.completed ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-white'
                                        }`}
                                >
                                    {item.text}
                                </Text>
                                {item.url && (
                                    <TouchableOpacity
                                        onPress={() => handleOpenUrl(item.url!)}
                                        className="ml-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-2 py-1"
                                    >
                                        <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">🔗 Link</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => handleDeleteItem(item.id)}
                                    className="ml-2 p-1"
                                >
                                    <Text className="text-gray-300 dark:text-slate-500 text-lg">✕</Text>
                                </TouchableOpacity>
                            </View>
                            {item.url && (
                                <Text className="text-xs text-gray-400 dark:text-slate-400 ml-10 mt-1" numberOfLines={1}>
                                    {item.url}
                                </Text>
                            )}
                        </View>
                    )}
                />
            )}

            {/* Add Item Bar */}
            <View className="bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 px-4 py-3">
                <View className="flex-row items-center">
                    <TextInput
                        className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-base mr-2"
                        placeholder="Add an item..."
                        placeholderTextColor="#9CA3AF"
                        value={newItemText}
                        onChangeText={setNewItemText}
                        onSubmitEditing={handleAddItem}
                        returnKeyType="done"
                    />
                    <TouchableOpacity
                        onPress={() => setShowUrlInput(!showUrlInput)}
                        className={`w-10 h-10 rounded-xl items-center justify-center mr-2 ${showUrlInput ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-slate-700'}`}
                    >
                        <Text className="text-base">🔗</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleAddItem}
                        disabled={!newItemText.trim()}
                        className={`w-12 h-12 rounded-xl items-center justify-center ${!newItemText.trim() ? 'bg-gray-200 dark:bg-slate-700' : ''
                            }`}
                        style={newItemText.trim() ? { backgroundColor: color || '#4F46E5' } : undefined}
                    >
                        <Text className="text-white text-xl font-bold">+</Text>
                    </TouchableOpacity>
                </View>
                {showUrlInput && (
                    <TextInput
                        className="mt-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm"
                        placeholder="Paste link (optional) e.g. https://amazon.com/..."
                        placeholderTextColor="#9CA3AF"
                        value={newItemUrl}
                        onChangeText={setNewItemUrl}
                        autoCapitalize="none"
                        keyboardType="url"
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
