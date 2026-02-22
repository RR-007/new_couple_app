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
    year?: string
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

// --- TMDB Search (free, no API key needed for basic search) ---

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '';

export const searchTMDB = async (
    queryStr: string,
    type: 'movie' | 'show' = 'movie'
): Promise<{
    title: string;
    poster?: string;
    rating?: number;
    overview?: string;
    year?: string;
}[]> => {
    if (!TMDB_API_KEY) return []; // No API key, skip search

    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(queryStr)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();

        return (data.results || []).slice(0, 5).map((item: any) => ({
            title: item.title || item.name || queryStr,
            poster: item.poster_path
                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                : undefined,
            rating: item.vote_average || undefined,
            overview: item.overview?.slice(0, 150) || undefined,
            year: (item.release_date || item.first_air_date || '').slice(0, 4) || undefined,
        }));
    } catch {
        return [];
    }
};
