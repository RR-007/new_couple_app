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

// --- Types ---

export interface LoveNote {
    id: string;
    text: string;
    authorUid: string;
    createdAt: any;
}

// --- CRUD ---

export const createNote = async (
    coupleId: string,
    text: string,
    userId: string
) => {
    const notesRef = collection(db, 'couples', coupleId, 'notes');
    const newNote = await addDoc(notesRef, {
        text,
        authorUid: userId,
        createdAt: serverTimestamp(),
    });
    return newNote.id;
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
