import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import {
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Complete any pending browser sessions
WebBrowser.maybeCompleteAuthSession();

// --- Configuration ---

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

const SCOPES = [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/calendar.events',
];

GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: SCOPES,
    offlineAccess: true, // required for refresh token / server auth code
});

// --- Auth Request Hook ---

export const useGoogleAuth = () => {
    const promptAsync = async () => {
        try {
            await GoogleSignin.hasPlayServices();

            // Force account selection by signing out first if already signed in
            try {
                await GoogleSignin.signOut();
            } catch (e) {
                // Not signed in — that's fine
            }

            const userInfo = await GoogleSignin.signIn();

            // If sign-in returned without a user (shouldn't happen, but guard)
            if (!userInfo) {
                return { type: 'cancel' };
            }

            const tokens = await GoogleSignin.getTokens();

            return {
                type: 'success',
                params: {
                    id_token: tokens.idToken,
                    access_token: tokens.accessToken,
                    expires_in: 3599,
                },
                authentication: {
                    idToken: tokens.idToken,
                    accessToken: tokens.accessToken,
                    expiresIn: 3599,
                }
            };
        } catch (error: any) {
            console.error('Google Sign-In Error:', error?.code, error?.message);

            // Handle all cancellation variants (string code + numeric statusCode)
            const isCancelled =
                error.code === 'SIGN_IN_CANCELLED' ||
                error.code === 'E_SIGN_IN_CANCELLED' ||
                error.code === 12501 ||
                error?.statusCode === 12501;

            if (isCancelled) {
                return { type: 'cancel' };
            }
            return { type: 'error', error: new Error(error.message || 'Google Sign-In failed.') };
        }
    };

    // return mock request (true when loaded) and mock response (null until used)
    return { request: true, response: null, promptAsync };
};

// --- Token Storage in Firestore ---

export const saveGoogleToken = async (
    coupleId: string | undefined | null,
    userId: string,
    accessToken: string,
    expiresIn: number,
    email: string
) => {
    const docData = {
        accessToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        email,
        connected: true,
        updatedAt: serverTimestamp(),
    };
    if (coupleId) {
        const tokenRef = doc(db, 'couples', coupleId, 'googleTokens', userId);
        await setDoc(tokenRef, docData);
    } else {
        const tokenRef = doc(db, 'users', userId, 'googleTokens', 'data');
        await setDoc(tokenRef, docData);
    }
};

export const getGoogleToken = async (
    coupleId: string | undefined | null,
    userId: string
): Promise<{ accessToken: string; email: string; expiresAt: string } | null> => {
    let snap;
    if (coupleId) {
        snap = await getDoc(doc(db, 'couples', coupleId, 'googleTokens', userId));
    } else {
        snap = await getDoc(doc(db, 'users', userId, 'googleTokens', 'data'));
    }

    if (!snap.exists()) return null;

    const data = snap.data();
    // Check if disconnected or missing token
    if (!data.accessToken || data.connected === false) return null;
    // Check if token is expired
    if (!data.expiresAt || new Date(data.expiresAt) < new Date()) {
        return null;
    }
    return {
        accessToken: data.accessToken,
        email: data.email,
        expiresAt: data.expiresAt,
    };
};

export const getPartnerGoogleToken = async (
    coupleId: string,
    myUid: string,
    partnerUid: string
): Promise<{ accessToken: string; email: string } | null> => {
    const tokenRef = doc(db, 'couples', coupleId, 'googleTokens', partnerUid);
    const snap = await getDoc(tokenRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    if (new Date(data.expiresAt) < new Date()) return null;
    return { accessToken: data.accessToken, email: data.email };
};

// --- Fetch Google User Info ---

export const fetchGoogleUserInfo = async (
    accessToken: string
): Promise<{ email: string; name: string; picture: string }> => {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to fetch Google user info');
    return res.json();
};

// --- Disconnect ---

export const disconnectGoogle = async (coupleId: string | undefined | null, userId: string) => {
    if (coupleId) {
        await deleteDoc(doc(db, 'couples', coupleId, 'googleTokens', userId));
    }
    await deleteDoc(doc(db, 'users', userId, 'googleTokens', 'data'));
};
