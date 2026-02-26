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

export interface DiaryEntry {
    id: string;
    text: string;
    photos: string[]; // Cloudinary URLs
    authorUid: string;
    createdAt: any;
}

// --- Cloudinary Photo Upload ---

import { uploadMedia } from '../utils/cloudinary';

export const uploadDiaryPhoto = async (
    coupleId: string,
    uri: string
): Promise<string> => {
    return await uploadMedia(uri, `couple-app/${coupleId}/diary`);
};

// --- Diary CRUD ---

export const createDiaryEntry = async (
    coupleId: string,
    text: string,
    photoUrls: string[],
    userId: string
) => {
    const diaryRef = collection(db, 'couples', coupleId, 'diary');
    const newEntry = await addDoc(diaryRef, {
        text,
        photos: photoUrls,
        authorUid: userId,
        createdAt: serverTimestamp(),
    });
    return newEntry.id;
};

export const subscribeToDiary = (
    coupleId: string,
    callback: (entries: DiaryEntry[]) => void
) => {
    const diaryRef = collection(db, 'couples', coupleId, 'diary');
    const q = query(diaryRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const entries = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as DiaryEntry[];
        callback(entries);
    });
};

export const deleteDiaryEntry = async (coupleId: string, entryId: string) => {
    const entryRef = doc(db, 'couples', coupleId, 'diary', entryId);
    await deleteDoc(entryRef);
};
