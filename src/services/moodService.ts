import {
    collection,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// --- Types ---

export interface MoodEntry {
    id: string;
    mood: string;
    uid: string;
    date: string;
    createdAt: any;
}

const MOODS = ['😊', '😍', '😴', '😢', '😤', '🤔'] as const;
export { MOODS };

// --- Helpers ---

export const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// --- CRUD ---

export const logMood = async (
    coupleId: string,
    mood: string,
    userId: string
) => {
    const date = getTodayDateStr();
    const docId = `${date}_${userId}`;
    const moodRef = doc(db, 'couples', coupleId, 'moods', docId);

    await setDoc(moodRef, {
        mood,
        uid: userId,
        date,
        createdAt: serverTimestamp(),
    }, { merge: true });
};

export const subscribeToTodaysMoods = (
    coupleId: string,
    callback: (moods: MoodEntry[]) => void
) => {
    const date = getTodayDateStr();
    const moodsRef = collection(db, 'couples', coupleId, 'moods');
    const q = query(moodsRef, where('date', '==', date));

    return onSnapshot(q, (snapshot) => {
        const moods = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as MoodEntry[];
        callback(moods);
    });
};
