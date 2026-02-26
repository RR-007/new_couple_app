import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useAuth } from '../../../src/context/AuthContext';
import { BingoBoard, BingoTile, initializeBingoBoard, reviewBingoTile, submitBingoTile, subscribeToBingoBoard } from '../../../src/services/bingoService';
import { uploadMedia } from '../../../src/utils/cloudinary';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 40) / 5; // 5x5 grid with some padding

export default function BingoScreen() {
    const { user, coupleId } = useAuth();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [board, setBoard] = useState<BingoBoard | null>(null);
    const [loading, setLoading] = useState(true);

    const [permission, requestPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const [activeTile, setActiveTile] = useState<number | null>(null);
    const cameraRef = useRef<any>(null);
    const [uploading, setUploading] = useState(false);

    // New States for Reviews & Media Viewing
    const [viewingTile, setViewingTile] = useState<BingoTile | null>(null);
    const [promptDetailTile, setPromptDetailTile] = useState<BingoTile | null>(null);
    const [cameraMode, setCameraMode] = useState<'picture' | 'video'>('picture');
    const [isRecording, setIsRecording] = useState(false);

    // Use the current week as the board ID so it resets weekly
    const currentWeek = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    const boardId = `week-${currentWeek}`;

    useEffect(() => {
        if (!coupleId) return;

        let unsubscribe: () => void;

        const setupBoard = async () => {
            try {
                await initializeBingoBoard(coupleId, boardId);
                unsubscribe = subscribeToBingoBoard(coupleId, boardId, (newBoard) => {
                    setBoard(newBoard);
                    setLoading(false);
                });
            } catch (error) {
                console.error("Error setting up bingo board:", error);
                setLoading(false);
            }
        };

        setupBoard();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [coupleId, boardId]);

    const handleTilePress = (tileId: number) => {
        const tile = board?.tiles.find(t => t.id === tileId);

        if (tile?.status === 'completed' || tile?.status === 'pending') {
            setViewingTile(tile);
            return;
        }

        if (tile && (tile.status === 'empty' || !tile.status)) {
            setPromptDetailTile(tile);
        }
    };

    const openCameraForTile = (tileId: number) => {
        if (!permission?.granted || !micPermission?.granted) {
            requestPermission();
            requestMicPermission();
            return;
        }
        setPromptDetailTile(null);
        setActiveTile(tileId);
    };

    const handleMediaCapture = async (uri: string, type: 'image' | 'video') => {
        if (!activeTile || !coupleId || !user?.uid) return;
        try {
            setUploading(true);
            const proofUrl = await uploadMedia(uri, 'bingo_proofs', type);
            await submitBingoTile(coupleId, boardId, activeTile, user.uid, proofUrl, type);
            setActiveTile(null);
            Alert.alert("Success!", "Sent for partner review!");
        } catch (error) {
            console.error("Error completing tile:", error);
            Alert.alert("Error", "Failed to upload media. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const takePicture = async () => {
        if (!cameraRef.current || isRecording) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                base64: false,
            });
            await handleMediaCapture(photo.uri, 'image');
        } catch (e) {
            console.error(e);
        }
    };

    const toggleRecording = async () => {
        if (!cameraRef.current) return;

        if (isRecording) {
            cameraRef.current.stopRecording();
            setIsRecording(false);
        } else {
            setIsRecording(true);
            try {
                const video = await cameraRef.current.recordAsync({
                    maxDuration: 15, // 15s limit for bingo vids
                });
                if (video) {
                    await handleMediaCapture(video.uri, 'video');
                }
            } catch (e) {
                console.error(e);
                setIsRecording(false);
            }
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    if (!board) {
        return (
            <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
                <Text style={{ color: isDark ? '#fff' : '#000' }}>Error loading board.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Flashbang Bingo</Text>

            <View style={styles.grid}>
                {board.tiles.map((tile) => (
                    <TouchableOpacity
                        key={tile.id}
                        style={[
                            styles.tile,
                            {
                                backgroundColor: isDark ? '#334155' : '#f1f5f9',
                                borderColor: isDark ? '#475569' : '#e2e8f0',
                            },
                            (tile.status === 'completed' || tile.status === 'pending') && styles.tileCompleted
                        ]}
                        onPress={() => handleTilePress(tile.id)}
                        disabled={tile.status === 'completed' || tile.status === 'pending' ? false : false} // always clickable now
                    >
                        {(tile.status === 'completed' || tile.status === 'pending') && tile.proofUrl && (
                            <Image
                                source={{ uri: tile.proofUrl }}
                                style={[styles.tileImage, tile.status === 'pending' && { opacity: 0.3 }]}
                                contentFit="cover"
                            />
                        )}
                        <Text
                            style={[
                                styles.tileText,
                                { color: isDark ? '#e2e8f0' : '#1e293b' },
                                (tile.status === 'completed' || tile.status === 'pending') && { color: '#ffffff' }
                            ]}
                            numberOfLines={4}
                        >
                            {tile.text}
                        </Text>

                        {tile.status === 'completed' && (
                            <View style={styles.completedOverlay}>
                                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                            </View>
                        )}
                        {tile.status === 'pending' && (
                            <View style={styles.completedOverlay}>
                                <Ionicons name="time" size={24} color="#f59e0b" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Prompt Detail Modal (for reading full text before capturing) */}
            <Modal
                visible={promptDetailTile !== null}
                animationType="fade"
                transparent={true}
            >
                <View style={styles.promptDetailOverlay}>
                    <View style={styles.promptDetailCard}>
                        <Text style={styles.promptDetailTitle}>Challenge Context</Text>
                        <Text style={styles.promptDetailText}>{promptDetailTile?.text}</Text>
                        <View style={styles.promptDetailActions}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.rejectBtn, { paddingHorizontal: 20 }]}
                                onPress={() => setPromptDetailTile(null)}
                            >
                                <Text style={styles.actionBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#8b5cf6', paddingHorizontal: 20 }]}
                                onPress={() => openCameraForTile(promptDetailTile!.id)}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.actionBtnText}>Complete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Media Viewer & Review Modal */}
            <Modal
                visible={viewingTile !== null}
                animationType="fade"
                transparent={true}
            >
                <View style={styles.viewerContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setViewingTile(null)}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.viewingPromptContainer}>
                        <Text style={styles.viewingPromptText}>{viewingTile?.text}</Text>
                    </View>

                    {viewingTile?.mediaType === 'video' ? (
                        <Video
                            source={{ uri: viewingTile.proofUrl! }}
                            style={styles.fullMedia}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay
                            isLooping
                        />
                    ) : (
                        <Image
                            source={{ uri: viewingTile?.proofUrl || '' }}
                            style={styles.fullMedia}
                            contentFit="contain"
                        />
                    )}

                    {viewingTile?.status === 'pending' && (
                        <View style={styles.reviewWidget}>
                            {viewingTile.completedBy === user?.uid ? (
                                <View style={styles.reviewWidgetCard}>
                                    <Text style={styles.reviewText}>Waiting for partner to review ⏳</Text>
                                    <Text style={styles.reviewSubText}>They must accept this for it to count!</Text>
                                </View>
                            ) : (
                                <View style={styles.reviewWidgetCard}>
                                    <Text style={styles.reviewText}>Review Partner's Submission:</Text>
                                    <View style={styles.reviewButtons}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.rejectBtn]}
                                            onPress={async () => {
                                                await reviewBingoTile(coupleId!, boardId, viewingTile.id, false);
                                                setViewingTile(null);
                                            }}
                                        >
                                            <Ionicons name="close-circle" size={20} color="#fff" />
                                            <Text style={styles.actionBtnText}>Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.acceptBtn]}
                                            onPress={async () => {
                                                await reviewBingoTile(coupleId!, boardId, viewingTile.id, true);
                                                setViewingTile(null);
                                            }}
                                        >
                                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            <Text style={styles.actionBtnText}>Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </Modal>

            {/* Camera Overlay */}
            <Modal
                visible={activeTile !== null}
                animationType="slide"
                transparent={false}
            >
                <View style={styles.cameraContainer}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="back"
                        mode={cameraMode}
                    >
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => {
                                    if (isRecording) toggleRecording();
                                    setActiveTile(null);
                                }}
                                disabled={uploading}
                            >
                                <Ionicons name="close" size={30} color="#fff" />
                            </TouchableOpacity>

                            <View style={styles.cameraControlsOverlay}>
                                <View style={styles.modeToggle}>
                                    <TouchableOpacity
                                        style={[styles.modeBtn, cameraMode === 'picture' && styles.modeBtnActive]}
                                        onPress={() => setCameraMode('picture')}
                                    >
                                        <Text style={styles.modeText}>Photo</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modeBtn, cameraMode === 'video' && styles.modeBtnActive]}
                                        onPress={() => setCameraMode('video')}
                                    >
                                        <Text style={styles.modeText}>Video</Text>
                                    </TouchableOpacity>
                                </View>

                                {uploading ? (
                                    <View style={styles.captureButtonContainer}>
                                        <ActivityIndicator size="large" color="#8b5cf6" />
                                        <Text style={{ color: 'white', marginTop: 10 }}>Uploading...</Text>
                                    </View>
                                ) : (
                                    <View style={styles.captureButtonContainer}>
                                        {cameraMode === 'picture' ? (
                                            <TouchableOpacity
                                                style={styles.captureButton}
                                                onPress={takePicture}
                                            />
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.captureButton, isRecording && styles.recordingButton]}
                                                onPress={toggleRecording}
                                            >
                                                {isRecording && <View style={styles.recordingInner} />}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    </CameraView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        alignItems: 'center',
    },
    containerLight: {
        backgroundColor: '#f8fafc',
    },
    containerDark: {
        backgroundColor: '#0f172a',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
        paddingHorizontal: 20,
    },
    tile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderWidth: 1,
        borderRadius: 4,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    tileCompleted: {
        backgroundColor: '#8b5cf6', // Indigo if completed
        borderColor: '#7c3aed',
    },
    tileText: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: '500',
        zIndex: 1, // Keep text above image technically if needed, but usually image covers it mostly
    },
    tileImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6, // Dim image slightly so text might be visible, or we hide text
    },
    completedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    cameraControlsOverlay: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
    },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 4,
        marginBottom: 20,
    },
    modeBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 16,
    },
    modeBtnActive: {
        backgroundColor: '#8b5cf6',
    },
    modeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    captureButtonContainer: {
        alignItems: 'center',
        height: 80,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        borderWidth: 5,
        borderColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingButton: {
        borderColor: '#ef4444', // Red border for video
    },
    recordingInner: {
        width: 20,
        height: 20,
        backgroundColor: '#ef4444',
        borderRadius: 4,
    },
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullMedia: {
        width: '100%',
        height: '80%',
    },
    reviewWidget: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        paddingHorizontal: 20,
    },
    reviewWidgetCard: {
        backgroundColor: '#1e293b',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    reviewText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    reviewSubText: {
        color: '#94a3b8',
        fontSize: 13,
    },
    reviewButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
    },
    acceptBtn: {
        backgroundColor: '#10b981',
    },
    rejectBtn: {
        backgroundColor: '#ef4444',
    },
    actionBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    viewingPromptContainer: {
        position: 'absolute',
        top: 100,
        width: '90%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 15,
        borderRadius: 12,
        zIndex: 10,
    },
    viewingPromptText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
    },
    promptDetailOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    promptDetailCard: {
        width: '80%',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    promptDetailTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#94a3b8',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    promptDetailText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f8fafc',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 28,
    },
    promptDetailActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        justifyContent: 'center',
    },
});
