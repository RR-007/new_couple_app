import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { uploadDiaryPhoto } from '../services/diaryService';

interface DailyPic {
    id: string;
    imageUrl: string;
    uploadedBy: string;
    createdAt: any;
}

export default function PicOfTheDay() {
    const { coupleId, user } = useAuth();
    const [pics, setPics] = useState<DailyPic[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);

    useEffect(() => {
        if (!coupleId) return;

        // Fetch the all pics of the day
        const q = query(
            collection(db, 'couples', coupleId, 'pic_of_the_day'),
            orderBy('createdAt', 'desc'),
            limit(50) // Arbitrary limit for now
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DailyPic[];
            setPics(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [coupleId]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                await uploadSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to select image.");
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "We need camera permissions to take a picture.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                await uploadSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error taking photo:", error);
            Alert.alert("Error", "Failed to take photo.");
        }
    };

    const uploadSelectedImage = async (uri: string) => {
        if (!coupleId || !user) return;
        setUploading(true);
        try {
            const uploadedUrl = await uploadDiaryPhoto(coupleId, uri);
            if (!uploadedUrl) throw new Error("Upload failed");

            // Save to Firestore
            await addDoc(collection(db, 'couples', coupleId, 'pic_of_the_day'), {
                imageUrl: uploadedUrl,
                uploadedBy: user.uid,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error uploading pic of the day:", error);
            Alert.alert("Error", "Failed to upload photo. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm mb-6 items-center justify-center h-48">
                <ActivityIndicator color="#6366f1" />
            </View>
        );
    }

    const latestPic = pics.length > 0 ? pics[0] : null;

    return (
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm mb-6 space-y-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">Pic of the Day 📸</Text>

            {latestPic ? (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setViewerVisible(true)}
                    className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-video"
                >
                    <Image
                        source={{ uri: latestPic.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            ) : (
                <View className="rounded-2xl bg-slate-100 dark:bg-slate-700 aspect-video items-center justify-center">
                    <MaterialIcons name="photo-album" size={48} color="#94a3b8" />
                    <Text className="text-slate-500 dark:text-slate-400 mt-2">No pic today yet!</Text>
                </View>
            )}

            <View className="flex-row space-x-3 mt-2">
                <TouchableOpacity
                    onPress={takePhoto}
                    disabled={uploading}
                    className={`flex-1 flex-row items-center justify-center p-3.5 rounded-xl ${uploading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                >
                    {uploading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialIcons name="photo-camera" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Camera</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={pickImage}
                    disabled={uploading}
                    className={`flex-1 flex-row items-center justify-center p-3.5 rounded-xl border-2 ${uploading ? 'bg-transparent border-indigo-400' : 'bg-transparent border-indigo-600 dark:border-indigo-400'}`}
                >
                    {uploading ? (
                        <ActivityIndicator color="#6366f1" />
                    ) : (
                        <>
                            <MaterialIcons name="photo-library" size={20} color="#6366f1" className="dark:text-indigo-400" />
                            <Text className="text-indigo-600 dark:text-indigo-400 font-bold ml-2">Gallery</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Full Screen History Viewer Modal */}
            <Modal
                visible={viewerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setViewerVisible(false)}
            >
                <View className="flex-1 bg-black">
                    <View className="flex-row justify-between items-center pt-14 pb-4 px-6 bg-black z-20">
                        <Text className="text-white text-xl font-bold">History</Text>
                        <TouchableOpacity
                            onPress={() => setViewerVisible(false)}
                            className="bg-white/20 p-2 rounded-full"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={pics}
                        keyExtractor={item => item.id}
                        pagingEnabled
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={{ height: Dimensions.get('window').height - 100, width: Dimensions.get('window').width }} className="justify-center items-center pb-20">
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={{ width: '100%', height: '80%' }}
                                    resizeMode="contain"
                                />
                                <View className="absolute bottom-32 items-center w-full px-6">
                                    <Text className="text-white text-sm opacity-90 font-medium">
                                        {item.createdAt ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : Date.now()).toLocaleDateString(undefined, {
                                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                                        }) : 'Recently'}
                                    </Text>
                                    <Text className="text-white text-xs opacity-60 mt-1 pb-4">
                                        Uploaded by {item.uploadedBy === user?.uid ? 'You' : 'Partner'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}

