import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { checkNoteAchievements } from './achievementService';
import { recordActivity } from './streakService';

// --- Types ---

export interface LoveNote {
    id: string;
    text: string;
    authorUid: string;
    createdAt: any;
    location?: {
        lat: number;
        lng: number;
        name?: string;
    };
}

// --- CRUD ---

export const createNote = async (
    coupleId: string,
    text: string,
    userId: string,
    location?: { lat: number; lng: number; name?: string }
) => {
    const notesRef = collection(db, 'couples', coupleId, 'notes');
    const noteData: any = {
        text,
        authorUid: userId,
        createdAt: serverTimestamp(),
    };

    if (location) {
        noteData.location = location;
    }

    const newNote = await addDoc(notesRef, noteData);

    // Track streak activity and note count achievements in background
    Promise.all([
        recordActivity(coupleId, userId),
        checkNoteAchievements(coupleId, userId)
    ]).catch((e) =>
        console.warn('Background stat tracking failed:', e)
    );

    return newNote;
};

export const subscribeToNotes = (
    coupleId: string,
    callback: (notes: LoveNote[]) => void
) => {
    const notesRef = collection(db, 'couples', coupleId, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as LoveNote[];
        callback(notes);
    });
};

export const deleteNote = async (coupleId: string, noteId: string) => {
    const noteRef = doc(db, 'couples', coupleId, 'notes', noteId);
    await deleteDoc(noteRef);
};
