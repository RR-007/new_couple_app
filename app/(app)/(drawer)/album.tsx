import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { subscribeToBingoBoard } from '../../../src/services/bingoService'; // Note: Will need to fetch ALL boards ideally, or aggregate
import { subscribeToDiary } from '../../../src/services/diaryService';

const { width } = Dimensions.get('window');
const SPACING = 2;
const NUM_COLUMNS = 3;
const THUMBNAIL_SIZE = (width - (SPACING * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

type AggregatePhoto = {
    id: string;
    url: string;
    timestamp: number;
    source: 'diary' | 'bingo' | 'potd'; // origin of photo
};

type PhotoGroup = {
    title: string;
    data: AggregatePhoto[];
};

export default function AlbumScreen() {
    const { coupleId } = useAuth();
    const router = useRouter();
    const [groupedPhotos, setGroupedPhotos] = useState<PhotoGroup[]>([]);
    const [totalPhotos, setTotalPhotos] = useState(0);
    const [loading, setLoading] = useState(true);

    // Viewer State
    const [selectedPhoto, setSelectedPhoto] = useState<AggregatePhoto | null>(null);

    useEffect(() => {
        if (!coupleId) return;

        let allPhotos: AggregatePhoto[] = [];
        let diaryResolved = false;
        let bingoResolved = false; // We'll just grab the current week for now, or you'd fetch all boards from a generic collection group
        let potdResolved = false;

        const checkFinished = () => {
            if (diaryResolved && potdResolved && bingoResolved) {
                // Sort newest first
                allPhotos.sort((a, b) => b.timestamp - a.timestamp);

                // Group by date
                const groups: { [key: string]: AggregatePhoto[] } = {};
                allPhotos.forEach(photo => {
                    const dateStr = new Date(photo.timestamp).toLocaleDateString(undefined, {
                        month: 'long', day: 'numeric', year: 'numeric'
                    });
                    if (!groups[dateStr]) {
                        groups[dateStr] = [];
                    }
                    groups[dateStr].push(photo);
                });

                const groupArray = Object.keys(groups).map(date => ({
                    title: date,
                    data: groups[date]
                }));

                setGroupedPhotos(groupArray);
                setTotalPhotos(allPhotos.length);
                setLoading(false);
            }
        };

        // 1. Fetch Diary Photos
        const unsubDiary = subscribeToDiary(coupleId, (entries) => {
            const diaryPhotos: AggregatePhoto[] = [];
            entries.forEach(entry => {
                if (entry.photos) {
                    entry.photos.forEach((url, index) => {
                        diaryPhotos.push({
                            id: `diary-${entry.id}-${index}`,
                            url,
                            timestamp: entry.createdAt?.toMillis ? entry.createdAt.toMillis() : Date.now(),
                            source: 'diary'
                        });
                    });
                }
            });
            // Replace existing diary photos in the aggregate array
            allPhotos = allPhotos.filter(p => p.source !== 'diary').concat(diaryPhotos);
            diaryResolved = true;
            checkFinished();
        });

        // 2. Fetch Pic of the Day history (Mocking this as we'd need to just pull from the stats if we stored URLs there, but POTD primarily saves explicitly if we wanted to. We'll skip deep POTD history if it's not stored as an array of URLs, but we can fetch the current one).
        potdResolved = true; // Assuming POTD is transient or handled via Diary currently.

        // 3. Fetch Bingo Photos (for current week as placeholder, ideally we query across all bingo_boards)
        const currentWeek = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
        const boardId = `week-${currentWeek}`;
        const unsubBingo = subscribeToBingoBoard(coupleId, boardId, (board) => {
            const bingoPhotos: AggregatePhoto[] = [];
            if (board) {
                board.tiles.forEach(tile => {
                    if ((tile.status === 'completed' || tile.status === 'pending') && tile.proofUrl && tile.mediaType === 'image') {
                        bingoPhotos.push({
                            id: `bingo-${board.id}-${tile.id}`,
                            url: tile.proofUrl,
                            timestamp: tile.completedAt || Date.now(),
                            source: 'bingo'
                        });
                    }
                });
            }
            allPhotos = allPhotos.filter(p => p.source !== 'bingo').concat(bingoPhotos);
            bingoResolved = true;
            checkFinished();
        });

        return () => {
            if (unsubDiary) unsubDiary();
            if (unsubBingo) unsubBingo();
        };
    }, [coupleId]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const renderPhoto = ({ item }: { item: AggregatePhoto }) => (
        <TouchableOpacity
            onPress={() => setSelectedPhoto(item)}
            style={{ margin: SPACING / 2 }}
        >
            <Image
                source={{ uri: item.url }}
                style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, borderRadius: 8 }}
                contentFit="cover"
                transition={200}
            />
            <View className="absolute bottom-1 right-1 bg-black/50 px-1.5 py-0.5 rounded-md">
                <Text className="text-[10px] text-white">
                    {item.source === 'diary' ? '📓' : item.source === 'bingo' ? '🎲' : '📸'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
            <View className="bg-white dark:bg-slate-900 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800 flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">Our Album</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {totalPhotos} memories captured
                    </Text>
                </View>
            </View>

            {totalPhotos === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-5xl mb-4">🖼️</Text>
                    <Text className="text-lg font-semibold text-gray-700 dark:text-slate-300 text-center">No photos yet</Text>
                    <Text className="text-gray-400 dark:text-slate-500 text-center mt-2">
                        Photos from your Diary, Bingo, and Pic of the Day will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={groupedPhotos}
                    keyExtractor={(item) => item.title}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-slate-900">
                                {item.title}
                            </Text>
                            <FlatList
                                data={item.data}
                                keyExtractor={(photo) => photo.id}
                                numColumns={NUM_COLUMNS}
                                scrollEnabled={false} // Disable scrolling for inner list
                                renderItem={(props) => renderPhoto(props)}
                                contentContainerStyle={{ paddingHorizontal: SPACING }}
                            />
                        </View>
                    )}
                />
            )}

            {/* Full Screen Image Viewer Modal */}
            <Modal
                visible={!!selectedPhoto}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedPhoto(null)}
            >
                <View className="flex-1 bg-black/95 justify-center items-center">
                    <TouchableOpacity
                        onPress={() => setSelectedPhoto(null)}
                        className="absolute top-12 right-6 z-10 p-2 bg-white/20 rounded-full"
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    {selectedPhoto && (
                        <Image
                            source={{ uri: selectedPhoto.url }}
                            style={{ width: '100%', height: '80%' }}
                            contentFit="contain"
                        />
                    )}

                    <View className="absolute bottom-12 items-center w-full px-6">
                        <Text className="text-white text-sm opacity-70">
                            Source: {selectedPhoto?.source?.toUpperCase()}
                        </Text>
                        {selectedPhoto?.timestamp && (
                            <Text className="text-white text-sm opacity-70 mt-1">
                                {new Date(selectedPhoto.timestamp).toLocaleDateString(undefined, {
                                    month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            </Text>
                        )}
                    </View>
                </View>
            </Modal>

        </View>
    );
}
