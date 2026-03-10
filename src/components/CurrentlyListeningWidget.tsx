import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrentlyPlaying, SpotifyTrack } from '../services/spotifyApiService';
import { getSpotifyTokenData } from '../services/spotifyAuthService';

export default function CurrentlyListeningWidget() {
    const { user, profile, coupleId } = useAuth();
    const { customization } = useTheme();
    const { colorScheme } = useColorScheme();
    const [myTrack, setMyTrack] = useState<SpotifyTrack | null>(null);
    const [partnerTrack, setPartnerTrack] = useState<SpotifyTrack | null>(null);
    const [loading, setLoading] = useState(true);

    const bgColor = customization.theme?.secondary || (colorScheme === 'dark' ? '#1e293b' : '#ffffff');

    const fetchTracks = useCallback(async () => {
        if (!coupleId || !user) return;

        try {
            // My Track
            const myTokenData = await getSpotifyTokenData(coupleId, user.uid);
            if (myTokenData && myTokenData.accessToken) {
                const track = await getCurrentlyPlaying(myTokenData.accessToken);
                setMyTrack(track);
            }

            // Partner Track
            if (profile?.partnerUid) {
                const partnerTokenData = await getSpotifyTokenData(coupleId, profile.partnerUid);
                if (partnerTokenData && partnerTokenData.accessToken) {
                    const track = await getCurrentlyPlaying(partnerTokenData.accessToken);
                    setPartnerTrack(track);
                }
            }
        } catch (e) {
            console.error('Error fetching tracks for widget:', e);
        } finally {
            setLoading(false);
        }
    }, [coupleId, user, profile?.partnerUid]);

    useEffect(() => {
        fetchTracks();
        // Poll every 15 seconds
        const interval = setInterval(() => fetchTracks(), 15000);
        return () => clearInterval(interval);
    }, [fetchTracks]);

    if (loading) {
        return (
            <View
                className="rounded-2xl p-5 border border-secondary-100 dark:border-secondary-100/20 mx-4 mt-4 items-center justify-center min-h-[100px]"
                style={{ backgroundColor: bgColor }}
            >
                <ActivityIndicator color="#1DB954" />
            </View>
        );
    }

    const renderTrackCard = (title: string, track: SpotifyTrack | null) => {
        return (
            <View className="flex-1 bg-secondary rounded-xl p-3 border border-secondary-100 dark:border-secondary-100/20">
                <Text className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2 text-center">
                    {title}
                </Text>
                {track ? (
                    <TouchableOpacity
                        className="items-center"
                        onPress={() => track.spotifyUrl ? Linking.openURL(track.spotifyUrl) : null}
                    >
                        {track.albumArtUrl ? (
                            <Image
                                source={{ uri: track.albumArtUrl }}
                                className="w-16 h-16 rounded-md mb-2 shadow-sm"
                            />
                        ) : (
                            <View className="w-16 h-16 rounded-md mb-2 bg-gray-200 dark:bg-slate-700 items-center justify-center">
                                <Text className="text-2xl">🎵</Text>
                            </View>
                        )}
                        <Text className="text-sm font-bold text-gray-900 dark:text-white text-center" numberOfLines={1}>
                            {track.name}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-slate-400 text-center" numberOfLines={1}>
                            {track.artist}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="items-center justify-center flex-1 py-4">
                        <Text className="text-sm text-gray-400 dark:text-slate-500 text-center">
                            Not listening
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View
            className="mx-4 mt-4 rounded-2xl p-4 border border-secondary-100 dark:border-secondary-100/20"
            style={{ backgroundColor: bgColor }}
        >
            <View className="flex-row items-center mb-3 px-2">
                <Text className="text-xl">🎵</Text>
                <Text className="text-lg font-bold text-gray-800 dark:text-slate-200 ml-2">
                    Currently Listening
                </Text>
            </View>
            <View className="flex-row gap-3">
                {renderTrackCard('You', myTrack)}
                {renderTrackCard('Partner', partnerTrack)}
            </View>
        </View>
    );
}
