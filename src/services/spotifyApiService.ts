export interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    albumArtUrl: string;
    isPlaying: boolean;
    progressMs: number;
    durationMs: number;
    spotifyUrl: string;
}

/**
 * Fetch the user's currently playing track from the Spotify API.
 * Returns null if nothing is playing.
 */
export const getCurrentlyPlaying = async (accessToken: string): Promise<SpotifyTrack | null> => {
    if (!accessToken) return null;

    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // 204 No Content means nothing is currently playing
        if (response.status === 204) {
            return null;
        }

        // Handle token expiration or other errors without crashing the app
        if (!response.ok) {
            console.warn(`Spotify API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        // If it's playing a podcast/episode, the structure is slightly different 
        // We'll focus on 'track' types for now
        if (!data || !data.item || data.currently_playing_type !== 'track') {
            return null;
        }

        const track = data.item;
        const album = track.album;
        const mainArtist = track.artists && track.artists.length > 0 ? track.artists[0].name : 'Unknown Artist';
        const albumArtUrl = album.images && album.images.length > 0 ? album.images[0].url : '';

        return {
            id: track.id,
            name: track.name,
            artist: mainArtist,
            albumArtUrl,
            isPlaying: data.is_playing || false,
            progressMs: data.progress_ms || 0,
            durationMs: track.duration_ms || 0,
            spotifyUrl: track.external_urls?.spotify || '',
        };
    } catch (e) {
        console.error('Error fetching currently playing from Spotify API', e);
        return null;
    }
};

/**
 * Search Spotify for tracks matching a query.
 */
export const searchTracks = async (query: string, accessToken: string): Promise<SpotifyTrack[]> => {
    if (!accessToken || !query.trim()) return [];

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.warn(`Spotify API error (Search): ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        const items = data.tracks?.items || [];

        return items.map((track: any) => {
            const album = track.album;
            const mainArtist = track.artists && track.artists.length > 0 ? track.artists[0].name : 'Unknown Artist';
            const albumArtUrl = album.images && album.images.length > 0 ? album.images[0].url : '';

            return {
                id: track.id,
                name: track.name,
                artist: mainArtist,
                albumArtUrl,
                isPlaying: false,
                progressMs: 0,
                durationMs: track.duration_ms || 0,
                spotifyUrl: track.external_urls?.spotify || '',
            } as SpotifyTrack;
        });
    } catch (e) {
        console.error('Error searching Spotify tracks', e);
        return [];
    }
};
