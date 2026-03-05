import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// --- Types ---

export interface ListItem {
    id: string;
    text: string;
    completed: boolean;
    url?: string;
    addedBy: string;
    createdAt: any;
}

export interface CoupleList {
    id: string;
    name: string;
    icon: string;
    color: string;
    createdBy: string;
    createdAt: any;
}

// --- Default Lists ---

const DEFAULT_LISTS = [
    { name: 'To-Do', icon: '✅', color: '#10b981' },
    { name: 'Bucket List', icon: '🪣', color: '#f59e0b' },
];

/**
 * Ensures default lists (To-Do, Bucket List) exist for a space.
 * Only creates them if the space has zero custom lists.
 */
export const ensureDefaultLists = async (coupleId: string, userId: string) => {
    const listsRef = collection(db, 'couples', coupleId, 'lists');
    const existing = await getDocs(listsRef);
    if (!existing.empty) return; // Already has lists, skip

    for (const preset of DEFAULT_LISTS) {
        await addDoc(listsRef, {
            name: preset.name,
            icon: preset.icon,
            color: preset.color,
            createdBy: userId,
            createdAt: serverTimestamp(),
        });
    }
};

// --- List CRUD ---

export const createList = async (
    coupleId: string,
    name: string,
    icon: string,
    color: string,
    userId: string
) => {
    const listsRef = collection(db, 'couples', coupleId, 'lists');
    const newList = await addDoc(listsRef, {
        name,
        icon,
        color,
        createdBy: userId,
        createdAt: serverTimestamp(),
    });
    return newList.id;
};

export const subscribeToLists = (
    coupleId: string,
    callback: (lists: CoupleList[]) => void
) => {
    const listsRef = collection(db, 'couples', coupleId, 'lists');
    const q = query(listsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const lists = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as CoupleList[];
        callback(lists);
    });
};

export const updateList = async (
    coupleId: string,
    listId: string,
    updates: Partial<Pick<CoupleList, 'name' | 'icon' | 'color'>>
) => {
    const listRef = doc(db, 'couples', coupleId, 'lists', listId);
    await updateDoc(listRef, updates);
};

export const deleteList = async (coupleId: string, listId: string) => {
    const listRef = doc(db, 'couples', coupleId, 'lists', listId);
    await deleteDoc(listRef);
};

// --- List Item CRUD ---

export const addListItem = async (
    coupleId: string,
    listId: string,
    text: string,
    userId: string,
    url?: string
) => {
    const itemsRef = collection(db, 'couples', coupleId, 'lists', listId, 'items');
    const itemData: any = {
        text,
        completed: false,
        addedBy: userId,
        createdAt: serverTimestamp(),
    };
    if (url) itemData.url = url;
    const newItem = await addDoc(itemsRef, itemData);
    return newItem.id;
};

export const subscribeToListItems = (
    coupleId: string,
    listId: string,
    callback: (items: ListItem[]) => void
) => {
    const itemsRef = collection(db, 'couples', coupleId, 'lists', listId, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as ListItem[];
        callback(items);
    });
};

export const toggleListItem = async (
    coupleId: string,
    listId: string,
    itemId: string,
    completed: boolean
) => {
    const itemRef = doc(db, 'couples', coupleId, 'lists', listId, 'items', itemId);
    await updateDoc(itemRef, { completed });
};

export const deleteListItem = async (
    coupleId: string,
    listId: string,
    itemId: string
) => {
    const itemRef = doc(db, 'couples', coupleId, 'lists', listId, 'items', itemId);
    await deleteDoc(itemRef);
};
