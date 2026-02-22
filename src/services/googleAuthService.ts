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

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

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
        scheme: 'couple-app',
    });

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: GOOGLE_CLIENT_ID,
            scopes: SCOPES,
            redirectUri,
            responseType: AuthSession.ResponseType.Token,
            usePKCE: false, // Implicit flow for simplicity (no backend)
        },
        discovery
    );

    return { request, response, promptAsync, redirectUri };
};

// --- Token Storage in Firestore ---

export const saveGoogleToken = async (
    coupleId: string,
    userId: string,
    accessToken: string,
    expiresIn: number,
    email: string
) => {
    const tokenRef = doc(db, 'couples', coupleId, 'googleTokens', userId);
    await setDoc(tokenRef, {
        accessToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        email,
        connected: true,
        updatedAt: serverTimestamp(),
    });
};

export const getGoogleToken = async (
    coupleId: string,
    userId: string
): Promise<{ accessToken: string; email: string; expiresAt: string } | null> => {
    const tokenRef = doc(db, 'couples', coupleId, 'googleTokens', userId);
    const snap = await getDoc(tokenRef);
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

export const disconnectGoogle = async (coupleId: string, userId: string) => {
    const tokenRef = doc(db, 'couples', coupleId, 'googleTokens', userId);
    await deleteDoc(tokenRef);
};
