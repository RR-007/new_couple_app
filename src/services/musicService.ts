import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SpotifyTrack } from './spotifyApiService';

export interface SavedTrack extends SpotifyTrack {
    docId?: string; // Firestore document ID
    savedByUid?: string;
    savedAt?: any;
    pickedByUid?: string;
    pickedAt?: any;
}

/**
 * Save a track to the couple's shared music list.
 */
export const saveTrack = async (coupleId: string, track: SpotifyTrack, uid: string) => {
    try {
        const musicRef = collection(db, `couples/${coupleId}/music`);
        await addDoc(musicRef, {
            ...track,
            savedByUid: uid,
            savedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error saving track to Firestore:", error);
        throw error;
    }
};

/**
 * Remove a track from the couple's shared music list.
 */
export const removeTrack = async (coupleId: string, docId: string) => {
    try {
        const trackRef = doc(db, `couples/${coupleId}/music`, docId);
        await deleteDoc(trackRef);
    } catch (error) {
        console.error("Error removing track from Firestore:", error);
        throw error;
    }
};

/**
 * Subscribe to the couple's shared music list in real-time.
 */
export const subscribeToMusic = (coupleId: string, callback: (tracks: SavedTrack[]) => void) => {
    const musicRef = collection(db, `couples/${coupleId}/music`);
    const q = query(musicRef, orderBy('savedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const tracks: SavedTrack[] = [];
        snapshot.forEach((docSnap) => {
            tracks.push({
                ...docSnap.data(),
                docId: docSnap.id,
            } as SavedTrack);
        });
        callback(tracks);
    }, (error) => {
        console.error("Error subscribing to music:", error);
    });
};

/**
 * Set the Song of the Day.
 */
export const setSongOfTheDay = async (coupleId: string, track: SpotifyTrack, uid: string) => {
    try {
        const musicRef = doc(db, `couples/${coupleId}/songOfTheDay`, 'current');
        await setDoc(musicRef, {
            ...track,
            pickedByUid: uid,
            pickedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error setting song of the day:", error);
        throw error;
    }
};

/**
 * Subscribe to the current Song of the Day.
 */
export const subscribeToSongOfTheDay = (coupleId: string, callback: (track: SavedTrack | null) => void) => {
    const musicRef = doc(db, `couples/${coupleId}/songOfTheDay`, 'current');

    return onSnapshot(musicRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({
                ...docSnap.data(),
                docId: docSnap.id,
            } as SavedTrack);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("Error subscribing to song of the day:", error);
    });
};

