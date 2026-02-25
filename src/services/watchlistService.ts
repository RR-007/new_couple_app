import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// --- Types ---

export interface WatchlistItem {
    id: string;
    title: string;
    type: 'movie' | 'show';
    poster?: string;
    rating?: number;
    overview?: string;
    year?: string;
    watched: boolean;
    addedBy: string;
    tags?: string[];
    createdAt: any;
}

// --- Firestore ---

const watchRef = (coupleId: string) =>
    collection(db, 'couples', coupleId, 'watchlist');

export const addToWatchlist = async (
    coupleId: string,
    title: string,
    type: 'movie' | 'show',
    addedBy: string,
    poster?: string,
    rating?: number,
    overview?: string,
    year?: string,
    tags: string[] = []
) => {
    return addDoc(watchRef(coupleId), {
        title,
        type,
        poster: poster || null,
        rating: rating || null,
        overview: overview || null,
        year: year || null,
        watched: false,
        addedBy,
        tags,
        createdAt: serverTimestamp(),
    });
};

export const toggleWatched = async (coupleId: string, itemId: string, current: boolean) => {
    const ref = doc(db, 'couples', coupleId, 'watchlist', itemId);
    await updateDoc(ref, { watched: !current });
};

export const deleteWatchlistItem = async (coupleId: string, itemId: string) => {
    const ref = doc(db, 'couples', coupleId, 'watchlist', itemId);
    await deleteDoc(ref);
};

export const subscribeToWatchlist = (
    coupleId: string,
    callback: (items: WatchlistItem[]) => void
) => {
    const q = query(watchRef(coupleId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
        const items = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as WatchlistItem[];
        callback(items);
    });
};

// --- iTunes Search (completely free, no API key needed) ---

export const searchMedia = async (
    queryStr: string,
    type: 'movie' | 'show' = 'movie'
): Promise<{
    title: string;
    poster?: string;
    rating?: number;
    overview?: string;
    year?: string;
}[]> => {
    const mediaType = type === 'movie' ? 'movie' : 'tvShow';
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(queryStr)}&media=${mediaType}&limit=5`;

    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();

        return (data.results || []).map((item: any) => ({
            title: item.trackName || item.collectionName || queryStr,
            // Replace 100x100 with higher resolution 600x600 if available
            poster: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : undefined,
            rating: undefined, // iTunes doesn't reliably provide a 1-10 rating in this endpoint
            overview: item.longDescription || item.shortDescription || undefined,
            year: item.releaseDate ? item.releaseDate.slice(0, 4) : undefined,
        }));
    } catch {
        return [];
    }
};
