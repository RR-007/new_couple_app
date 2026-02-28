import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { CameraType, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MerchantPitchCameraProps {
    onVideoRecorded: (uri: string) => void;
    onCancel: () => void;
    maxDurationSeconds?: number;
}

export default function MerchantPitchCamera({ onVideoRecorded, onCancel, maxDurationSeconds = 30 }: MerchantPitchCameraProps) {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const [facing, setFacing] = useState<CameraType>('front'); // Front facing for pitch
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(maxDurationSeconds);
    const cameraRef = useRef<CameraView>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const maxDurationRef = useRef(maxDurationSeconds);
    const stopRecordingRef = useRef<() => void>(() => {});

    // Keep ref updated
    useEffect(() => {
        maxDurationRef.current = maxDurationSeconds;
    }, [maxDurationSeconds]);

    // Store stopRecording in ref
    useEffect(() => {
        stopRecordingRef.current = () => {
            if (cameraRef.current && isRecording) {
                cameraRef.current.stopRecording();
            }
        };
    }, [isRecording]);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecordingRef.current();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeLeft(maxDurationRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    if (!cameraPermission || !micPermission) {
        return <View className="flex-1 justify-center items-center bg-black" />;
    }

    if (!cameraPermission.granted || !micPermission.granted) {
        return (
            <View className="flex-1 justify-center items-center bg-black p-6">
                <Text className="text-white text-center text-lg font-bold mb-4 font-outfit">
                    We need your permission to open the camera and microphone for your pitch.
                </Text>
                <TouchableOpacity
                    onPress={async () => {
                        await requestCameraPermission();
                        await requestMicPermission();
                    }}
                    className="bg-indigo-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold font-inter">Grant Permissions</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} className="mt-6">
                    <Text className="text-gray-400 font-inter">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        if (!isRecording) {
            setFacing(current => (current === 'back' ? 'front' : 'back'));
        }
    };

    const startRecording = async () => {
        if (cameraRef.current && !isRecording) {
            setIsRecording(true);
            try {
                const videoRecordPromise = cameraRef.current.recordAsync({
                    maxDuration: maxDurationSeconds,
                });

                if (videoRecordPromise) {
                    const video = await videoRecordPromise;
                    if (video && video.uri) {
                        setPreviewUri(video.uri);
                    }
                }
            } catch (error) {
                console.error("Failed to record video:", error);
            } finally {
                setIsRecording(false);
            }
        }
    };

    const stopRecording = () => {
        if (cameraRef.current && isRecording) {
            cameraRef.current.stopRecording();
        }
    };

    const handleConfirm = () => {
        if (previewUri) {
            onVideoRecorded(previewUri);
        }
    };

    const handleRetake = () => {
        setPreviewUri(null);
    };

    if (previewUri) {
        return (
            <View className="flex-1 bg-black">
                <Video
                    source={{ uri: previewUri }}
                    style={StyleSheet.absoluteFillObject}
                    useNativeControls
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    shouldPlay
                />

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
                        <Text className="text-white font-bold ml-2 text-lg font-inter">Submit Pitch</Text>
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
                mode="video"
            >
                <View className="absolute top-12 left-6">
                    <TouchableOpacity onPress={onCancel} disabled={isRecording} className={`bg-black/50 p-3 rounded-full ${isRecording ? 'opacity-30' : ''}`}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="absolute top-12 right-6">
                    <TouchableOpacity onPress={toggleCameraFacing} disabled={isRecording} className={`bg-black/50 p-3 rounded-full ${isRecording ? 'opacity-30' : ''}`}>
                        <Ionicons name="camera-reverse" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Pitch Overlay UI */}
                <View className="absolute top-24 left-0 right-0 items-center">
                    <View className="bg-black/60 px-6 py-2 rounded-full border border-yellow-500/30 flex-row items-center">
                        <View className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-red-500' : 'bg-transparent border border-gray-400'}`} />
                        <Text className="text-white font-bold font-mono text-lg">
                            00:{timeLeft.toString().padStart(2, '0')}
                        </Text>
                    </View>
                    <Text className="text-yellow-400/80 font-bold mt-2 text-sm uppercase tracking-wider">Merchant Pitch</Text>
                </View>

                <View className="absolute bottom-12 left-0 right-0 items-center pb-8">
                    {!isRecording ? (
                        <TouchableOpacity
                            onPress={startRecording}
                            className="w-20 h-20 rounded-full border-4 border-red-500 bg-red-500/20 items-center justify-center p-1"
                        >
                            <View className="w-full h-full bg-red-500 rounded-full" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={stopRecording}
                            className="w-20 h-20 rounded-full border-4 border-red-500 bg-red-500/20 items-center justify-center py-5 px-5"
                        >
                            <View className="w-full h-full bg-red-500 rounded-lg" />
                        </TouchableOpacity>
                    )}
                </View>
            </CameraView>
        </View>
    );
}
