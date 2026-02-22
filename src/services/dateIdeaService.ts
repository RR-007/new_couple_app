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

export interface DateIdea {
    id: string;
    text: string;
    addedBy: string;
    done: boolean;
    createdAt: any;
}

// --- CRUD ---

export const addDateIdea = async (
    coupleId: string,
    text: string,
    userId: string
) => {
    const ideasRef = collection(db, 'couples', coupleId, 'dateIdeas');
    const newIdea = await addDoc(ideasRef, {
        text,
        addedBy: userId,
        done: false,
        createdAt: serverTimestamp(),
    });
    return newIdea.id;
};

export const subscribeToDateIdeas = (
    coupleId: string,
    callback: (ideas: DateIdea[]) => void
) => {
    const ideasRef = collection(db, 'couples', coupleId, 'dateIdeas');
    const q = query(ideasRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const ideas = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as DateIdea[];
        callback(ideas);
    });
};

export const markDateIdeaDone = async (
    coupleId: string,
    ideaId: string,
    done: boolean
) => {
    const ideaRef = doc(db, 'couples', coupleId, 'dateIdeas', ideaId);
    await updateDoc(ideaRef, { done });
};

export const deleteDateIdea = async (coupleId: string, ideaId: string) => {
    const ideaRef = doc(db, 'couples', coupleId, 'dateIdeas', ideaId);
    await deleteDoc(ideaRef);
};
