import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
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
    const [pic, setPic] = useState<DailyPic | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!coupleId) return;

        // Fetch the most recent pic of the day
        const q = query(
            collection(db, 'couples', coupleId, 'pic_of_the_day'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                setPic({ id: doc.id, ...doc.data() } as DailyPic);
            } else {
                setPic(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [coupleId]);

    const handleGooglePhotosImport = async () => {
        // TODO (Google Photos Integration Stub):
        // 1. Authenticate with Google Photos API using EXPO_PUBLIC_GOOGLE_PHOTOS_API_KEY
        // 2. Fetch recent photos using https://photoslibrary.googleapis.com/v1/mediaItems
        // 3. Allow user to select one and retrieve the URL

        // For now, fallback to local device gallery to simulate picking a photo
        Alert.alert(
            "Google Photos API Expected",
            "API keys are pending. Falling back to device gallery for MVP.",
            [{ text: "OK", onPress: pickImage }]
        );
    };

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

    return (
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm mb-6 space-y-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">Pic of the Day 📸</Text>

            {pic ? (
                <View className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-video">
                    <Image
                        source={{ uri: pic.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>
            ) : (
                <View className="rounded-2xl bg-slate-100 dark:bg-slate-700 aspect-video items-center justify-center">
                    <MaterialIcons name="photo-album" size={48} color="#94a3b8" />
                    <Text className="text-slate-500 dark:text-slate-400 mt-2">No pic today yet!</Text>
                </View>
            )}

            <View className="flex-row space-x-3">
                <TouchableOpacity
                    onPress={takePhoto}
                    disabled={uploading}
                    className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${uploading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                >
                    {uploading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialIcons name="photo-camera" size={24} color="white" />
                            <Text className="text-white font-bold ml-2">Take Photo</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={pickImage}
                    disabled={uploading}
                    className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${uploading ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                    {uploading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialIcons name="photo-library" size={24} color={uploading ? "white" : "#4F46E5"} />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleGooglePhotosImport}
                    disabled={uploading}
                    className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${uploading ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                    {uploading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialIcons name="cloud-download" size={24} color={uploading ? "white" : "#4F46E5"} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
