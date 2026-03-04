import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, orderBy, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Space {
    id: string; // The firestore ID (using the 'couples' collection for backward compatibility)
    name: string;
    type: 'partner' | 'friends' | 'squad';
    joinCode: string;
    members: string[]; // UIDs of all members
    createdAt: any;
}

export interface UserSpaceRecord {
    id: string; // same as spaceId
    role: 'owner' | 'member';
    joinedAt: any;
    name: string;
    type: string;
}

// Generate a random 6 character alphanumeric code for spaces
export const generateSpaceJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Creates a new space and adds the user to it.
 */
export const createSpace = async (userId: string, name: string, type: 'partner' | 'friends' | 'squad'): Promise<Space> => {
    const spaceRef = doc(collection(db, 'couples')); // reusing 'couples' collection for spaces to avoid massive data migrations
    const joinCode = generateSpaceJoinCode();

    const newSpace: Omit<Space, 'id'> = {
        name,
        type,
        joinCode,
        members: [userId],
        createdAt: serverTimestamp(),
    };

    const userSpaceRef = doc(db, 'users', userId, 'spaces', spaceRef.id);
    const userSpaceRecord: Omit<UserSpaceRecord, 'id'> = {
        role: 'owner',
        joinedAt: serverTimestamp(),
        name,
        type
    };

    // Use transaction to ensure both documents are written
    await runTransaction(db, async (transaction) => {
        transaction.set(spaceRef, newSpace);
        transaction.set(userSpaceRef, userSpaceRecord);

        // Update legacy user profile array if needed for quick querying
        const userRef = doc(db, 'users', userId);
        transaction.update(userRef, {
            spacesList: arrayUnion(spaceRef.id)
        });
    });

    return { id: spaceRef.id, ...newSpace, createdAt: new Date() };
};

/**
 * Join an existing space using a join code.
 */
export const joinSpace = async (userId: string, joinCode: string): Promise<Space> => {
    // 1. Find space by join code
    const spacesRef = collection(db, 'couples');
    const q = query(spacesRef, where('joinCode', '==', joinCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Invalid join code. Space not found.");
    }

    const spaceDoc = querySnapshot.docs[0];
    const spaceData = spaceDoc.data() as Omit<Space, 'id'>;
    const spaceId = spaceDoc.id;

    if (spaceData.members && spaceData.members.includes(userId)) {
        throw new Error("You are already a member of this space.");
    }

    const userSpaceRef = doc(db, 'users', userId, 'spaces', spaceId);
    const userSpaceRecord: Omit<UserSpaceRecord, 'id'> = {
        role: 'member',
        joinedAt: serverTimestamp(),
        name: spaceData.name || 'Unnamed Space',
        type: spaceData.type || 'partner'
    };

    // 2. Transaction to add user to space
    await runTransaction(db, async (transaction) => {
        const freshSpaceDoc = await transaction.get(spaceDoc.ref);
        if (!freshSpaceDoc.exists()) throw new Error("Space not found mapping");

        const freshData = freshSpaceDoc.data() as Space;
        const currentMembers = freshData.members || [];

        if (currentMembers.includes(userId)) {
            throw new Error("Already a member");
        }

        // Add to space members
        transaction.update(spaceDoc.ref, {
            members: [...currentMembers, userId]
        });

        // Add to user's spaces subcollection
        transaction.set(userSpaceRef, userSpaceRecord);

        // Update legacy user profile array for quick querying
        const userRef = doc(db, 'users', userId);
        transaction.update(userRef, {
            spacesList: arrayUnion(spaceId),
            // Legacy fallbacks for single-space partner view (app backward compat)
            partnerUid: currentMembers.length === 1 ? currentMembers[0] : null,
            coupleId: spaceId
        });
    });

    return { id: spaceId, ...spaceData, members: [...(spaceData.members || []), userId] };
};

/**
 * Fetch all spaces a user belongs to
 */
export const getUserSpaces = async (userId: string): Promise<UserSpaceRecord[]> => {
    const spacesRef = collection(db, 'users', userId, 'spaces');
    const q = query(spacesRef, orderBy('joinedAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as UserSpaceRecord[];
};

/**
 * Fetch full space details
 */
export const getSpaceDetails = async (spaceId: string): Promise<Space | null> => {
    const spaceRef = doc(db, 'couples', spaceId);
    const snap = await getDoc(spaceRef);
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Space;
    }
    return null;
};

/**
 * Leave a space — removes user from members array and deletes the user's space subcollection doc.
 */
export const leaveSpace = async (userId: string, spaceId: string): Promise<void> => {
    const spaceRef = doc(db, 'couples', spaceId);
    const userSpaceRef = doc(db, 'users', userId, 'spaces', spaceId);
    const userRef = doc(db, 'users', userId);

    await runTransaction(db, async (transaction) => {
        const freshSpaceDoc = await transaction.get(spaceRef);
        if (!freshSpaceDoc.exists()) throw new Error("Space not found");

        const freshData = freshSpaceDoc.data() as Space;
        const updatedMembers = (freshData.members || []).filter((uid: string) => uid !== userId);

        // Remove user from the space members array
        transaction.update(spaceRef, { members: updatedMembers });

        // Delete the user's space subcollection doc
        transaction.delete(userSpaceRef);

        // Remove from user's spacesList
        transaction.update(userRef, { spacesList: arrayRemove(spaceId) });
    });
};

/**
 * Rename a space — updates both the space doc and the user's space subcollection doc.
 */
export const renameSpace = async (userId: string, spaceId: string, newName: string): Promise<void> => {
    const spaceRef = doc(db, 'couples', spaceId);
    const userSpaceRef = doc(db, 'users', userId, 'spaces', spaceId);

    // Update both documents
    await updateDoc(spaceRef, { name: newName });
    await updateDoc(userSpaceRef, { name: newName });
};
