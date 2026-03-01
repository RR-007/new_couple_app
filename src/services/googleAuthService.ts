import * as AuthSession from 'expo-auth-session';
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

import { Platform } from 'react-native';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

const getClientId = () => {
    if (Platform.OS === 'ios') return GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID;
    if (Platform.OS === 'android') return GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID;
    return GOOGLE_WEB_CLIENT_ID;
};

const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const SCOPES = [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/calendar.events',
];

// --- Auth Request Hook ---

export const useGoogleAuth = () => {
    const redirectUri = AuthSession.makeRedirectUri({
        // @ts-ignore - useProxy is needed for Expo Go but removed from TS types in newer SDKs
        useProxy: true,
    });

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: getClientId(),
            scopes: SCOPES,
            redirectUri,
            responseType: 'id_token token' as any,
            usePKCE: false, // Implicit flow for simplicity (no backend)
            extraParams: {
                nonce: 'default_nonce_for_firebase' // Nonce is required when requesting id_token
            }
        },
        discovery
    );

    return { request, response, promptAsync, redirectUri };
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
