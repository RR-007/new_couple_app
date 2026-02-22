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

export interface ListItem {
    id: string;
    text: string;
    completed: boolean;
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
    userId: string
) => {
    const itemsRef = collection(db, 'couples', coupleId, 'lists', listId, 'items');
    const newItem = await addDoc(itemsRef, {
        text,
        completed: false,
        addedBy: userId,
        createdAt: serverTimestamp(),
    });
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
