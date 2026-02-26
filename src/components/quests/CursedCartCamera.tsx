import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlobalQuest } from '../../services/questService';

interface CursedCartCameraProps {
    quest: GlobalQuest;
    onPhotoTaken: (uri: string) => void;
    onCancel: () => void;
}

export default function CursedCartCamera({ quest, onPhotoTaken, onCancel }: CursedCartCameraProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState<string>('48:00:00');

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    useEffect(() => {
        // Calculate remaining time based on assigned_at + 48 hours
        if (!quest.assigned_at) return;

        let assignedTime: number;
        // Handle Firestore timestamp and regular date strings
        if (typeof quest.assigned_at.toMillis === 'function') {
            assignedTime = quest.assigned_at.toMillis();
        } else if (quest.assigned_at.seconds) {
            assignedTime = quest.assigned_at.seconds * 1000;
        } else {
            assignedTime = new Date(quest.assigned_at).getTime();
        }

        const endTime = assignedTime + (48 * 60 * 60 * 1000);

        const updateTimer = () => {
            const now = Date.now();
            const difference = endTime - now;

            if (difference <= 0) {
                setTimeLeft('00:00:00');
            } else {
                const hours = Math.floor((difference / (1000 * 60 * 60)));
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [quest.assigned_at]);

    const takePic = async () => {
        if (cameraRef && !photoUri && !isTakingPhoto) {
            setIsTakingPhoto(true);
            try {
                const photo = await cameraRef.takePictureAsync({
                    quality: 0.8,
                });
                if (photo) {
                    setPhotoUri(photo.uri);
                }
            } catch (error) {
                console.error("Failed to take photo", error);
                alert("Failed to take photo. Please try again.");
            } finally {
                setIsTakingPhoto(false);
            }
        }
    };

    if (hasPermission === null) {
        return <View className="flex-1 bg-black items-center justify-center"><ActivityIndicator size="large" color="#fff" /></View>;
    }
    if (hasPermission === false) {
        return (
            <View className="flex-1 bg-black items-center justify-center p-6">
                <Text className="text-white text-center mb-4">We need camera access to capture your cursed cart evidence.</Text>
                <TouchableOpacity onPress={onCancel} className="bg-red-600 px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (photoUri) {
        return (
            <View className="flex-1 bg-black">
                <Image source={{ uri: photoUri }} className="flex-1" contentFit="cover" />

                <View className="absolute inset-0 bg-red-900/30" />

                <View className="absolute top-16 w-full items-center">
                    <Text className="text-white text-3xl font-black uppercase tracking-widest bg-black/70 px-4 py-2 border-2 border-red-600 rounded">
                        EVIDENCE SECURED
                    </Text>
                </View>

                <View className="absolute bottom-12 w-full flex-row justify-around px-8">
                    <TouchableOpacity
                        onPress={() => setPhotoUri(null)}
                        className="bg-gray-800 border-2 border-gray-600 h-16 px-6 rounded-full items-center justify-center flex-row"
                    >
                        <Ionicons name="refresh" size={24} color="white" />
                        <Text className="text-white font-bold ml-2">Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onPhotoTaken(photoUri)}
                        className="bg-red-600 border-2 border-red-800 h-16 w-32 rounded-full items-center justify-center flex-row"
                    >
                        <Ionicons name="checkmark" size={28} color="white" />
                        <Text className="text-white font-bold text-lg ml-1">Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <CameraView
                className="flex-1"
                facing="back"
                ref={(ref) => setCameraRef(ref)}
            >
                <View className="absolute top-12 left-4 z-10">
                    <TouchableOpacity onPress={onCancel} className="bg-black/50 p-3 rounded-full">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Countdown Timer overlay */}
                <View className="absolute top-16 w-full items-center z-10">
                    <View className="bg-black/80 px-6 py-3 rounded-xl border-2 border-red-600 items-center">
                        <Text className="text-red-500 font-bold uppercase tracking-widest text-xs mb-1">Cursed Cart Timer</Text>
                        <Text className="text-white text-4xl font-black font-mono tracking-wider">{timeLeft}</Text>
                    </View>
                </View>

                {/* Crosshairs to make it feel like an operation */}
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                    <View className="w-64 h-64 border border-white/30 rounded flex items-center justify-center">
                        <View className="w-4 h-4 rounded-full border border-red-500/50" />
                    </View>
                </View>

                <View className="absolute bottom-12 w-full flex-row justify-center items-center">
                    <TouchableOpacity
                        onPress={takePic}
                        disabled={isTakingPhoto}
                        className="w-20 h-20 bg-transparent border-4 border-red-500 rounded-full p-1"
                    >
                        <View className="flex-1 bg-white rounded-full items-center justify-center">
                            {isTakingPhoto && <ActivityIndicator color="#ef4444" />}
                        </View>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({});
