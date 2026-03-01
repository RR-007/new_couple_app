import { collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
    uid: string;
    email: string | null;
    joinCode: string;
    partnerUid?: string;
    coupleId?: string;
    createdAt: any;
}

// Generate a random 6 character alphanumeric code
export const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createUserProfile = async (uid: string, email: string | null) => {
    const joinCode = generateJoinCode();
    const userRef = doc(db, 'users', uid);

    const newProfile = {
        uid,
        email,
        joinCode,
        createdAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
};

export const linkWithPartner = async (currentUserUid: string, partnerCode: string) => {
    try {
        // 1. Find the partner by their join code
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('joinCode', '==', partnerCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Invalid join code. Partner not found.");
        }

        const partnerDoc = querySnapshot.docs[0];
        const partnerData = partnerDoc.data() as UserProfile;

        if (partnerData.uid === currentUserUid) {
            throw new Error("You cannot use your own join code.");
        }

        if (partnerData.partnerUid) {
            throw new Error("This user is already linked with someone else.");
        }

        // 2. Perform a transaction to safely link both accounts and create the couple record
        const currentUserRef = doc(db, 'users', currentUserUid);
        const partnerRef = doc(db, 'users', partnerData.uid);
        const newCoupleRef = doc(collection(db, 'couples'));

        await runTransaction(db, async (transaction) => {
            // 1. ALL READS FIRST (Firestore requirement)
            const currentUserDoc = await transaction.get(currentUserRef);
            const freshPartnerDoc = await transaction.get(partnerRef);

            const currentUserTokenRef = doc(db, 'users', currentUserUid, 'googleTokens', 'data');
            const currentUserTokenDoc = await transaction.get(currentUserTokenRef);

            const partnerTokenRef = doc(db, 'users', partnerData.uid, 'googleTokens', 'data');
            const partnerTokenDoc = await transaction.get(partnerTokenRef);

            // 2. VALIDATION
            if (!currentUserDoc.exists()) {
                throw new Error("Current user profile not found!");
            }
            if (currentUserDoc.data()?.partnerUid) {
                throw new Error("You are already linked to a partner.");
            }
            if (freshPartnerDoc.data()?.partnerUid) {
                throw new Error("Partner was linked while processing.");
            }

            // 3. ALL WRITES AFTER (Firestore requirement)
            // Link them together
            transaction.update(currentUserRef, {
                partnerUid: partnerData.uid,
                coupleId: newCoupleRef.id
            });

            transaction.update(partnerRef, {
                partnerUid: currentUserUid,
                coupleId: newCoupleRef.id
            });

            // Create the couple record
            transaction.set(newCoupleRef, {
                user1: currentUserUid,
                user2: partnerData.uid,
                createdAt: serverTimestamp()
            });

            // Check and migrate google tokens for current user
            if (currentUserTokenDoc.exists()) {
                const newCoupleTokenRef = doc(db, 'couples', newCoupleRef.id, 'googleTokens', currentUserUid);
                transaction.set(newCoupleTokenRef, currentUserTokenDoc.data());
                transaction.delete(currentUserTokenRef);
            }

            // Check and migrate google tokens for partner
            if (partnerTokenDoc.exists()) {
                const newCouplePartnerTokenRef = doc(db, 'couples', newCoupleRef.id, 'googleTokens', partnerData.uid);
                transaction.set(newCouplePartnerTokenRef, partnerTokenDoc.data());
                transaction.delete(partnerTokenRef);
            }
        });

        return true;
    } catch (error) {
        console.error("Error linking with partner:", error);
        throw error;
    }
};
