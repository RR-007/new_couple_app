import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Linking, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { WishlistItem, addWishlistItem, claimWishlistItem, deleteWishlistItem, subscribeToWishlist, unclaimWishlistItem } from '../../services/giftService';

export default function WishlistTab() {
    const { user, activeSpaceId } = useAuth();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemUrl, setNewItemUrl] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemPriority, setNewItemPriority] = useState<1 | 2 | 3>(2);

    useEffect(() => {
        if (!activeSpaceId) return;
        const unsubscribe = subscribeToWishlist(activeSpaceId, (fetchedItems) => {
            setItems(fetchedItems);
        });
        return () => unsubscribe();
    }, [activeSpaceId]);

    const myItems = items.filter(i => i.createdBy === user?.uid && !i.isSurprise);
    const partnerItems = items.filter(i => (i.createdBy !== user?.uid && !i.isSurprise) || (i.createdBy === user?.uid && i.isSurprise));

    const handleAddItem = async () => {
        if (!newItemName.trim() || !activeSpaceId || !user) return;
        try {
            await addWishlistItem(activeSpaceId, {
                name: newItemName.trim(),
                url: newItemUrl.trim() || undefined,
                price: newItemPrice ? parseFloat(newItemPrice) : undefined,
                priority: newItemPriority,
                createdBy: user.uid,
            });
            setIsAddModalVisible(false);
            setNewItemName('');
            setNewItemUrl('');
            setNewItemPrice('');
            setNewItemPriority(2);
        } catch (error) {
            console.error("Error adding item:", error);
            Alert.alert("Error", "Could not add item to wishlist.");
        }
    };

    const handleDelete = (id: string) => {
        if (!activeSpaceId) return;
        Alert.alert("Delete Item", "Are you sure you want to remove this from your wishlist?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteWishlistItem(activeSpaceId, id) }
        ]);
    };

    const handleClaimToggle = async (item: WishlistItem) => {
        if (!activeSpaceId || !user) return;
        try {
            if (item.claimedBy === user.uid) {
                await unclaimWishlistItem(activeSpaceId, item.id);
            } else if (!item.claimedBy) {
                await claimWishlistItem(activeSpaceId, item.id, user.uid);
            }
        } catch (error) {
            console.error("Error toggling claim:", error);
        }
    };

    const openUrl = (url?: string) => {
        if (url) {
            // Basic validation to ensure absolute URL
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            Linking.openURL(fullUrl).catch(() => Alert.alert("Error", "Could not open link."));
        }
    };

    const renderItem = ({ item, isMine }: { item: WishlistItem, isMine: boolean }) => (
        <View className="bg-secondary p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm border border-secondary-100 dark:border-secondary-100/20">
            <View className="flex-1 pr-4">
                <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                    {item.name}
                </Text>
                {item.price && (
                    <Text className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                        ${item.price.toFixed(2)}
                    </Text>
                )}
                {item.url && (
                    <TouchableOpacity onPress={() => openUrl(item.url)} className="mt-2">
                        <Text className="text-blue-500 dark:text-blue-400 text-sm underline">View Link</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="items-end justify-between h-full">
                {isMine ? (
                    <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => handleClaimToggle(item)}
                        className={`px-4 py-2 rounded-lg ${item.claimedBy === user?.uid
                            ? 'bg-secondary-100 dark:bg-secondary-900/40 border border-secondary-500'
                            : item.claimedBy
                                ? 'bg-gray-200 dark:bg-slate-700'
                                : 'bg-primary-500'
                            }`}
                        disabled={!!item.claimedBy && item.claimedBy !== user?.uid}
                    >
                        <Text className={`font-bold ${item.claimedBy === user?.uid
                            ? 'text-secondary-700 dark:text-secondary-300'
                            : item.claimedBy
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-white'
                            }`}>
                            {item.claimedBy === user?.uid ? 'Claimed by you' : item.claimedBy ? 'Claimed' : 'Claim'}
                        </Text>
                    </TouchableOpacity>
                )}

                <View className="mt-2 flex-row">
                    {[...Array(3)].map((_, i) => (
                        <Ionicons
                            key={i}
                            name={i < (item.priority || 2) ? "star" : "star-outline"}
                            size={14}
                            color="#F59E0B"
                        />
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 p-4 bg-secondary">
            <FlatList
                data={[...partnerItems, ...myItems]}
                keyExtractor={i => i.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View className="mb-4">
                        {partnerItems.length > 0 && (
                            <Text className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-3 mt-2">Partner's Wishlist</Text>
                        )}
                    </View>
                )}
                renderItem={({ item }) => renderItem({ item, isMine: item.createdBy === user?.uid })}
                ListEmptyComponent={() => (
                    <View className="py-10 items-center justify-center">
                        <Text className="text-gray-500 dark:text-slate-400 text-center">No wishlist items yet.</Text>
                    </View>
                )}
            />

            <TouchableOpacity
                onPress={() => setIsAddModalVisible(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            <Modal visible={isAddModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold dark:text-white">Add to Wishlist</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="Item Name"
                            placeholderTextColor="#9CA3AF"
                            value={newItemName}
                            onChangeText={setNewItemName}
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-3 dark:text-white"
                        />

                        <TextInput
                            placeholder="Price (Optional)"
                            placeholderTextColor="#9CA3AF"
                            value={newItemPrice}
                            onChangeText={setNewItemPrice}
                            keyboardType="numeric"
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-3 dark:text-white"
                        />

                        <TextInput
                            placeholder="Link/URL (Optional)"
                            placeholderTextColor="#9CA3AF"
                            value={newItemUrl}
                            onChangeText={setNewItemUrl}
                            autoCapitalize="none"
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-4 dark:text-white"
                        />

                        <Text className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Priority (1=High, 3=Low)</Text>
                        <View className="flex-row justify-between mb-6">
                            {[1, 2, 3].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => setNewItemPriority(p as 1 | 2 | 3)}
                                    className={`flex-1 mx-1 py-3 rounded-xl border ${newItemPriority === p ? 'bg-primary-100 border-primary-500 dark:bg-primary-900' : 'bg-transparent border-gray-200 dark:border-slate-700'}`}
                                >
                                    <Text className={`text-center font-bold ${newItemPriority === p ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-slate-400'}`}>
                                        {p}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleAddItem}
                            className="w-full bg-primary-600 py-4 rounded-xl mb-8 items-center"
                        >
                            <Text className="text-white font-bold text-lg">Add Item</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
