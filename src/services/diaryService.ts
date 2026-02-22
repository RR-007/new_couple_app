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
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// --- Types ---

export interface DiaryEntry {
    id: string;
    text: string;
    photos: string[]; // Firebase Storage download URLs
    authorUid: string;
    createdAt: any;
}

// --- Photo Upload ---

export const uploadDiaryPhoto = async (
    coupleId: string,
    uri: string
): Promise<string> => {
    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `diary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const storageRef = ref(storage, `couples/${coupleId}/diary/${filename}`);

    await uploadBytesResumable(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
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
