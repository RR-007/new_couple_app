import * as AuthSession from 'expo-auth-session';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string;
const SPOTIFY_DISCOVERY = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Types
export interface SpotifyTokenData {
    accessToken: string;
    expiresAt: number; // timestamp in ms
}

/**
 * Hook to initialize the Spotify Auth Session.
 * We must request these specific scopes to read currently playing, 
 * and manage shared playlists later.
 */
export function useSpotifyAuth() {
    const redirectUri = AuthSession.makeRedirectUri();

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: CLIENT_ID,
            scopes: [
                'user-read-currently-playing',
                'user-read-recently-played',
                'user-top-read',
                'playlist-modify-public',
                'playlist-modify-private',
                'playlist-read-private',
                'playlist-read-collaborative'
            ],
            // In order to follow the "Implicit Grant Flow" or use standard Expo proxy behavior
            // We use token response type to get an access token directly back if possible
            // Or we use code and exchange it. Expo's useAuthRequest handles implicit by default 
            // if we specify responseType: AuthSession.ResponseType.Token
            responseType: AuthSession.ResponseType.Token,
            redirectUri,
        },
        SPOTIFY_DISCOVERY
    );

    return { request, response, promptAsync };
}

/**
 * Save the Spotify Access Token for a specific user to Firestore under the Couple's subcollection
 */
export const saveSpotifyToken = async (
    coupleId: string,
    userId: string,
    accessToken: string,
    expiresIn: number // seconds usually, e.g. 3600
) => {
    if (!coupleId || !userId || !accessToken) return;

    const expiresAt = Date.now() + (expiresIn * 1000);
    const ref = doc(db, 'couples', coupleId, 'spotifyTokens', userId);

    await setDoc(ref, {
        accessToken,
        expiresAt,
        updatedAt: Date.now()
    }, { merge: true });
};

/**
 * Get a user's Spotify Access Token from Firestore
 */
export const getSpotifyTokenData = async (
    coupleId: string,
    userId: string
): Promise<SpotifyTokenData | null> => {
    if (!coupleId || !userId) return null;

    const ref = doc(db, 'couples', coupleId, 'spotifyTokens', userId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const data = snap.data();
        if (data && data.accessToken) {
            return {
                accessToken: data.accessToken,
                expiresAt: data.expiresAt
            };
        }
    }
    return null;
};

/**
 * Disconnect Spotify
 */
export const disconnectSpotify = async (coupleId: string, userId: string) => {
    if (!coupleId || !userId) return;

    const ref = doc(db, 'couples', coupleId, 'spotifyTokens', userId);
    // Overwrite to empty to disconnect
    await setDoc(ref, {
        accessToken: null,
        expiresAt: null,
        updatedAt: Date.now()
    }, { merge: true });
};
