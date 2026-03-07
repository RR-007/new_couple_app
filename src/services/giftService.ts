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
    where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// --- Types ---

export interface WishlistItem {
    id: string;
    name: string;
    price?: number;
    url?: string;
    priority?: 1 | 2 | 3; // 1 = High, 2 = Medium, 3 = Low
    claimedBy?: string; // Hidden from creator if true
    createdBy: string;
    spaceId: string;
    isSurprise?: boolean;
    createdAt: any;
}

export interface GiftHistory {
    id: string;
    name: string;
    dateGiven: string; // ISO string 
    photoUrl?: string; // Cloudinary URL
    price?: number;
    givenBy: string;
    spaceId: string;
    occasion?: string;
    createdAt: any;
}

export interface GiftBudget {
    id: string;
    occasion: string;
    amountLimit: number;
    spaceId: string;
    createdAt: any;
}

// --- Wishlist CRUD ---

export const addWishlistItem = async (
    spaceId: string,
    item: Omit<WishlistItem, 'id' | 'createdAt' | 'spaceId'>
) => {
    const itemsRef = collection(db, 'spaces', spaceId, 'wishlist');
    const newItem = await addDoc(itemsRef, {
        ...item,
        spaceId,
        createdAt: serverTimestamp(),
    });
    return newItem.id;
};

export const subscribeToWishlist = (
    spaceId: string,
    callback: (items: WishlistItem[]) => void
) => {
    const itemsRef = collection(db, 'spaces', spaceId, 'wishlist');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as WishlistItem[];
        callback(items);
    });
};

export const updateWishlistItem = async (
    spaceId: string,
    itemId: string,
    updates: Partial<WishlistItem>
) => {
    const itemRef = doc(db, 'spaces', spaceId, 'wishlist', itemId);
    await updateDoc(itemRef, updates);
};

export const deleteWishlistItem = async (
    spaceId: string,
    itemId: string
) => {
    const itemRef = doc(db, 'spaces', spaceId, 'wishlist', itemId);
    await deleteDoc(itemRef);
};

export const claimWishlistItem = async (spaceId: string, itemId: string, claimerUserId: string) => {
    const itemRef = doc(db, 'spaces', spaceId, 'wishlist', itemId);
    await updateDoc(itemRef, { claimedBy: claimerUserId });
};

export const unclaimWishlistItem = async (spaceId: string, itemId: string) => {
    const itemRef = doc(db, 'spaces', spaceId, 'wishlist', itemId);
    await updateDoc(itemRef, { claimedBy: null });
};

// --- Gift History CRUD ---

export const addGiftHistory = async (
    spaceId: string,
    item: Omit<GiftHistory, 'id' | 'createdAt' | 'spaceId'>
) => {
    const historyRef = collection(db, 'spaces', spaceId, 'giftHistory');
    const newGift = await addDoc(historyRef, {
        ...item,
        spaceId,
        createdAt: serverTimestamp(),
    });
    return newGift.id;
};

export const subscribeToGiftHistory = (
    spaceId: string,
    callback: (items: GiftHistory[]) => void
) => {
    const historyRef = collection(db, 'spaces', spaceId, 'giftHistory');
    const q = query(historyRef, orderBy('dateGiven', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as GiftHistory[];
        callback(items);
    });
};

export const deleteGiftHistory = async (spaceId: string, itemId: string) => {
    const itemRef = doc(db, 'spaces', spaceId, 'giftHistory', itemId);
    await deleteDoc(itemRef);
};


// --- Budgets CRUD ---

export const setGiftBudget = async (
    spaceId: string,
    occasion: string,
    amountLimit: number
) => {
    const budgetsRef = collection(db, 'spaces', spaceId, 'budgets');
    // Upsert logic: Check if occasion already exists to update it, otherwise create
    const q = query(budgetsRef, where('occasion', '==', occasion));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        // Update existing
        const docId = snapshot.docs[0].id;
        const budgetRef = doc(db, 'spaces', spaceId, 'budgets', docId);
        await updateDoc(budgetRef, { amountLimit });
        return docId;
    } else {
        // Create new
        const newBudget = await addDoc(budgetsRef, {
            occasion,
            amountLimit,
            spaceId,
            createdAt: serverTimestamp(),
        });
        return newBudget.id;
    }
};

export const subscribeToBudgets = (
    spaceId: string,
    callback: (items: GiftBudget[]) => void
) => {
    const budgetsRef = collection(db, 'spaces', spaceId, 'budgets');
    const q = query(budgetsRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as GiftBudget[];
        callback(items);
    });
};

export const deleteBudget = async (spaceId: string, budgetId: string) => {
    const docRef = doc(db, 'spaces', spaceId, 'budgets', budgetId);
    await deleteDoc(docRef);
};
