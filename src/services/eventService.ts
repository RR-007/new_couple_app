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

export interface CoupleEvent {
    id: string;
    title: string;
    date: string; // ISO date string (YYYY-MM-DD)
    icon: string;
    createdBy: string;
    createdAt: any;
}

// --- Event CRUD ---

export const createEvent = async (
    coupleId: string,
    title: string,
    date: string,
    icon: string,
    userId: string
) => {
    const eventsRef = collection(db, 'couples', coupleId, 'events');
    const newEvent = await addDoc(eventsRef, {
        title,
        date,
        icon,
        createdBy: userId,
        createdAt: serverTimestamp(),
    });
    return newEvent.id;
};

export const subscribeToEvents = (
    coupleId: string,
    callback: (events: CoupleEvent[]) => void
) => {
    const eventsRef = collection(db, 'couples', coupleId, 'events');
    const q = query(eventsRef, orderBy('date', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as CoupleEvent[];
        callback(events);
    });
};

export const updateEvent = async (
    coupleId: string,
    eventId: string,
    updates: Partial<Pick<CoupleEvent, 'title' | 'date' | 'icon'>>
) => {
    const eventRef = doc(db, 'couples', coupleId, 'events', eventId);
    await updateDoc(eventRef, updates);
};

export const deleteEvent = async (coupleId: string, eventId: string) => {
    const eventRef = doc(db, 'couples', coupleId, 'events', eventId);
    await deleteDoc(eventRef);
};

// --- Helpers ---

export const getDaysUntil = (dateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
