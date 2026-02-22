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

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadDiaryPhoto = async (
    coupleId: string,
    uri: string
): Promise<string> => {
    const formData = new FormData();

    // For React Native, we need to create the file object differently
    const filename = uri.split('/').pop() || `photo_${Date.now()}`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
        uri,
        name: filename,
        type,
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET!);
    formData.append('folder', `couple-app/${coupleId}/diary`);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error('Cloudinary upload error:', data);
        throw new Error(data.error?.message || 'Upload failed');
    }

    return data.secure_url;
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
