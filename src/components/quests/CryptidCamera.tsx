import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CryptidCameraProps {
    onPhotoTaken: (uri: string) => void;
    onCancel: () => void;
}

export default function CryptidCamera({ onPhotoTaken, onCancel }: CryptidCameraProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        return <View className="flex-1 justify-center items-center bg-black" />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center bg-black p-6">
                <Text className="text-white text-center text-lg font-bold mb-4 font-outfit">
                    We need your permission to open the camera
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-indigo-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold font-inter">Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} className="mt-6">
                    <Text className="text-gray-400 font-inter">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                // Take a slightly lower quality photo to add to the cryptid vibe
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.3,
                });
                if (photo) {
                    setPreviewUri(photo.uri);
                }
            } catch (error) {
                console.error("Failed to take picture:", error);
            }
        }
    };

    const handleConfirm = () => {
        if (previewUri) {
            onPhotoTaken(previewUri);
        }
    };

    const handleRetake = () => {
        setPreviewUri(null);
    };

    if (previewUri) {
        return (
            <View className="flex-1 bg-black">
                {/* Apply extreme blur to the preview to show them what they captured */}
                <Image
                    source={{ uri: previewUri }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    blurRadius={4}
                />

                {/* Cryptid Overlay Filter (Greenish tint with static) */}
                <View className="absolute inset-0 bg-green-900/30" />
                <View className="absolute inset-0 border-[20px] border-black/50" />

                <View className="absolute bottom-0 left-0 right-0 p-8 flex-row justify-between items-center bg-black/60 pt-6 pb-12">
                    <TouchableOpacity
                        onPress={handleRetake}
                        className="bg-gray-800 p-4 rounded-full"
                    >
                        <MaterialIcons name="refresh" size={28} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleConfirm}
                        className="bg-indigo-500 px-8 py-4 rounded-full flex-row items-center"
                    >
                        <MaterialIcons name="check" size={24} color="white" />
                        <Text className="text-white font-bold ml-2 text-lg font-inter">Keep It Muted</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFillObject}
                facing={facing}
            >
                {/* Live Cryptid Filter Overlay */}
                <View className="absolute inset-0 bg-green-900/20" style={{ backdropFilter: 'blur(3px)' }} />

                <View className="absolute top-12 left-6">
                    <TouchableOpacity onPress={onCancel} className="bg-black/50 p-3 rounded-full">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="absolute top-12 right-6">
                    <TouchableOpacity onPress={toggleCameraFacing} className="bg-black/50 p-3 rounded-full">
                        <Ionicons name="camera-reverse" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Shaky/Glitchy UI Elements */}
                <View className="absolute top-1/4 left-0 right-0 items-center opacity-70">
                    <Text className="text-green-500 font-mono text-xl tracking-widest">[ TARGET ACQUIRED ]</Text>
                    <Text className="text-green-500/80 font-mono mt-1 text-sm bg-black/50 px-2 rounded">Keep it blurry.</Text>
                </View>

                <View className="absolute bottom-12 left-0 right-0 items-center pb-8">
                    <TouchableOpacity
                        onPress={takePicture}
                        className="w-20 h-20 rounded-full border-4 border-white/50 bg-white/20 items-center justify-center p-1"
                    >
                        <View className="w-full h-full bg-white rounded-full opacity-80" />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}
