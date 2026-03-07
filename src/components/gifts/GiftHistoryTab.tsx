import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { addGiftHistory, deleteGiftHistory, GiftHistory, subscribeToGiftHistory } from '../../services/giftService';
import { uploadMedia } from '../../utils/cloudinary';

export default function GiftHistoryTab() {
    const { user, activeSpaceId } = useAuth();
    const [items, setItems] = useState<GiftHistory[]>([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newGivenBy, setNewGivenBy] = useState('');
    const [newDateGiven, setNewDateGiven] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [newPrice, setNewPrice] = useState('');
    const [newOccasion, setNewOccasion] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!activeSpaceId) return;
        const unsubscribe = subscribeToGiftHistory(activeSpaceId, (fetchedItems) => {
            setItems(fetchedItems);
        });
        return () => unsubscribe();
    }, [activeSpaceId]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleAddGift = async () => {
        if (!newItemName.trim() || !newGivenBy.trim() || !activeSpaceId || !user) {
            Alert.alert("Missing Fields", "Please enter the gift name and who gave it.");
            return;
        }

        try {
            setIsUploading(true);
            let uploadedUrl;

            if (photoUri) {
                uploadedUrl = await uploadMedia(photoUri, `spaces/${activeSpaceId}/gifts`);
            }

            await addGiftHistory(activeSpaceId, {
                name: newItemName.trim(),
                givenBy: newGivenBy.trim(),
                dateGiven: newDateGiven,
                price: newPrice ? parseFloat(newPrice) : undefined,
                occasion: newOccasion.trim() || undefined,
                photoUrl: uploadedUrl,
            });

            setIsAddModalVisible(false);
            setNewItemName('');
            setNewGivenBy('');
            setNewPrice('');
            setNewOccasion('');
            setPhotoUri(null);
            setNewDateGiven(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error("Error adding gift history:", error);
            Alert.alert("Error", "Could not add gift history.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        if (!activeSpaceId) return;
        Alert.alert("Delete Gift", "Are you sure you want to remove this gift from history?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteGiftHistory(activeSpaceId, id) }
        ]);
    };

    const renderItem = ({ item }: { item: GiftHistory }) => (
        <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-4">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {item.name}
                    </Text>
                    <Text className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                        Given by: {item.givenBy}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-slate-400">
                        {new Date(item.dateGiven).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {item.photoUrl && (
                <Image
                    source={{ uri: item.photoUrl }}
                    className="w-full h-48 rounded-xl mt-3 bg-gray-100 dark:bg-slate-700"
                    resizeMode="cover"
                />
            )}
        </View>
    );

    return (
        <View className="flex-1 p-4 bg-gray-50 dark:bg-slate-900">
            <FlatList
                data={items}
                keyExtractor={i => i.id}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    <View className="py-10 items-center justify-center">
                        <Ionicons name="gift-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 dark:text-slate-400 text-center mt-4">
                            No gift history yet. Add a past gift!
                        </Text>
                    </View>
                )}
            />

            <TouchableOpacity
                onPress={() => setIsAddModalVisible(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            <Modal visible={isAddModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold dark:text-white">Log Past Gift</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)} disabled={isUploading}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="Gift Name"
                            placeholderTextColor="#9CA3AF"
                            value={newItemName}
                            onChangeText={setNewItemName}
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-3 dark:text-white"
                        />

                        <TextInput
                            placeholder="Given By (e.g., Me, Partner)"
                            placeholderTextColor="#9CA3AF"
                            value={newGivenBy}
                            onChangeText={setNewGivenBy}
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-3 dark:text-white"
                        />

                        <TextInput
                            placeholder="Price (Optional)"
                            placeholderTextColor="#9CA3AF"
                            value={newPrice}
                            onChangeText={setNewPrice}
                            keyboardType="numeric"
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-3 dark:text-white"
                        />

                        <TextInput
                            placeholder="Occasion (e.g., Anniversary, Birthday)"
                            placeholderTextColor="#9CA3AF"
                            value={newOccasion}
                            onChangeText={setNewOccasion}
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-3 dark:text-white"
                        />

                        <TextInput
                            placeholder="Date Given (YYYY-MM-DD)"
                            placeholderTextColor="#9CA3AF"
                            value={newDateGiven}
                            onChangeText={setNewDateGiven}
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-4 dark:text-white"
                        />

                        <Text className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Photo (Optional)</Text>
                        {photoUri ? (
                            <View className="relative mb-6">
                                <Image source={{ uri: photoUri }} className="w-full h-40 rounded-xl" />
                                <TouchableOpacity
                                    onPress={() => setPhotoUri(null)}
                                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                                >
                                    <Ionicons name="close" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={pickImage}
                                className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl items-center justify-center mb-6"
                            >
                                <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                                <Text className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Add a Photo</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={handleAddGift}
                            disabled={isUploading}
                            className={`w-full py-4 rounded-xl mb-8 items-center ${isUploading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                        >
                            {isUploading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Save Gift</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
