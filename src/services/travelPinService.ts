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

export interface TravelPin {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    visited: boolean;
    photo?: string;
    note?: string;
    createdBy: string;
    createdAt: any;
}

// --- Firestore ---

const pinsRef = (coupleId: string) =>
    collection(db, 'couples', coupleId, 'travelPins');

export const addTravelPin = async (
    coupleId: string,
    name: string,
    latitude: number,
    longitude: number,
    createdBy: string,
    note?: string
) => {
    return addDoc(pinsRef(coupleId), {
        name,
        latitude,
        longitude,
        visited: false,
        photo: null,
        note: note || null,
        createdBy,
        createdAt: serverTimestamp(),
    });
};

export const togglePinVisited = async (coupleId: string, pinId: string, current: boolean) => {
    const ref = doc(db, 'couples', coupleId, 'travelPins', pinId);
    await updateDoc(ref, { visited: !current });
};

export const deleteTravelPin = async (coupleId: string, pinId: string) => {
    const ref = doc(db, 'couples', coupleId, 'travelPins', pinId);
    await deleteDoc(ref);
};

export const subscribeToPins = (
    coupleId: string,
    callback: (pins: TravelPin[]) => void
) => {
    const q = query(pinsRef(coupleId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
        const pins = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as TravelPin[];
        callback(pins);
    });
};

// --- Geocoding (free, no API key) ---

export const geocodeSearch = async (
    query: string
): Promise<{ name: string; lat: number; lon: number }[]> => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'CoupleApp/1.0' },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((item: any) => ({
            name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
        }));
    } catch {
        return [];
    }
};
