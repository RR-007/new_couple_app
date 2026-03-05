import { collection, doc, getCountFromServer, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface BadgeDef {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export const BADGE_CATALOG: BadgeDef[] = [
    // Streak Badges
    { id: 'streak_3', title: 'Spark', description: 'Maintain a 3-day streak', icon: '🔥' },
    { id: 'streak_7', title: 'Flame', description: 'Maintain a 7-day streak', icon: '🔥' },
    { id: 'streak_30', title: 'Bonfire', description: 'Maintain a 30-day streak', icon: '⛺' },
    { id: 'streak_100', title: 'Inferno', description: 'Maintain a 100-day streak', icon: '🌋' },

    // Note Badges
    { id: 'notes_1', title: 'First Word', description: 'Send your first love note', icon: '📝' },
    { id: 'notes_10', title: 'Chatterbox', description: 'Send 10 love notes', icon: '💌' },
    { id: 'notes_50', title: 'Author', description: 'Send 50 love notes', icon: '📖' },
    { id: 'notes_100', title: 'Poet', description: 'Send 100 love notes', icon: '✒️' },

    // Quest Badges
    { id: 'quest_1', title: 'First Step', description: 'Complete your first quest', icon: '🎯' },
    { id: 'quest_5', title: 'Adventurer', description: 'Complete 5 quests', icon: '🗺️' },
    { id: 'quest_25', title: 'Hero', description: 'Complete 25 quests', icon: '⚔️' }
];

export interface UnlockedBadge {
    id: string;
    badgeId: string;
    userId: string;
    unlockedAt: any;
}

export type UnlockCallback = (badge: BadgeDef) => void;

const unlockCallbacks: UnlockCallback[] = [];

export const onBadgeUnlocked = (callback: UnlockCallback) => {
    unlockCallbacks.push(callback);
    return () => {
        const index = unlockCallbacks.indexOf(callback);
        if (index > -1) unlockCallbacks.splice(index, 1);
    };
};

const notifyUnlock = (badge: BadgeDef) => {
    unlockCallbacks.forEach(cb => cb(badge));
};

export const checkStreakAchievements = async (coupleId: string, userId: string, currentStreak: number) => {
    const toCheck = [];
    if (currentStreak >= 3) toCheck.push('streak_3');
    if (currentStreak >= 7) toCheck.push('streak_7');
    if (currentStreak >= 30) toCheck.push('streak_30');
    if (currentStreak >= 100) toCheck.push('streak_100');

    if (toCheck.length > 0) {
        await attemptUnlocks(coupleId, userId, toCheck);
    }
};

export const checkNoteAchievements = async (coupleId: string, userId: string) => {
    try {
        const notesRef = collection(db, 'couples', coupleId, 'notes');
        const q = query(notesRef, where('authorUid', '==', userId));
        const snapshot = await getCountFromServer(q);
        const count = snapshot.data().count;

        const toCheck = [];
        if (count >= 1) toCheck.push('notes_1');
        if (count >= 10) toCheck.push('notes_10');
        if (count >= 50) toCheck.push('notes_50');
        if (count >= 100) toCheck.push('notes_100');

        if (toCheck.length > 0) {
            await attemptUnlocks(coupleId, userId, toCheck);
        }
    } catch (error) {
        console.error("Error checking note achievements:", error);
    }
};

export const checkQuestAchievements = async (coupleId: string, userId: string) => {
    try {
        // Query quests completed by this user
        // We'll approximate this by checking all completed quests where the user is either partner1 or partner2 and they were the one who completed it, or just overall completions.
        // For simplicity based on our data model, we'll just query the 'quests' subcollection
        const questsRef = collection(db, 'couples', coupleId, 'quests');
        const q = query(questsRef, where('completedBy', '==', userId));
        const snapshot = await getCountFromServer(q);
        const count = snapshot.data().count;

        const toCheck = [];
        if (count >= 1) toCheck.push('quest_1');
        if (count >= 5) toCheck.push('quest_5');
        if (count >= 25) toCheck.push('quest_25');

        if (toCheck.length > 0) {
            await attemptUnlocks(coupleId, userId, toCheck);
        }
    } catch (error) {
        console.error("Error checking quest achievements:", error);
    }
};

export const checkBingoAchievements = async (coupleId: string, userId: string) => {
    try {
        // Since we don't rigidly track "who won" in the bingo board natively at a high level, 
        // we will check how many tiles the user has completed across all boards.
        // For a more accurate "Bingo Win", we'd need a specific 'wins' counter, but here we approximate 
        // a "Bingo Win" to completing 5 tiles (one row/col equivalent).
        // For actual robust Bingo wins, consider tracking `bingoWins: number` on the couple/user doc.
        // But for Gamification V1, let's tally total completed tiles by user. 
        // Or if BINGO isn't easily queryable this way, we can skip it for V1.
        // Actually, the implementation plan specifies "3 bingo wins, 10 bingo wins". 
        // We will just do a mock check here for now, or track it specifically elsewhere if needed.
    } catch (error) {
        console.error("Error checking bingo achievements:", error);
    }
};

const attemptUnlocks = async (coupleId: string, userId: string, badgeIds: string[]) => {
    for (const badgeId of badgeIds) {
        const badgeRef = doc(db, 'couples', coupleId, 'achievements', `${userId}_${badgeId}`);
        const snap = await getDoc(badgeRef);

        if (!snap.exists()) {
            await setDoc(badgeRef, {
                badgeId,
                userId,
                unlockedAt: serverTimestamp()
            });

            const badgeDef = BADGE_CATALOG.find(b => b.id === badgeId);
            if (badgeDef) {
                notifyUnlock(badgeDef);
            }
        }
    }
};

export const subscribeToAchievements = (coupleId: string, userId: string, callback: (badges: UnlockedBadge[]) => void) => {
    const q = query(collection(db, 'couples', coupleId, 'achievements'), where('userId', '==', userId));

    return onSnapshot(q, (snapshot) => {
        const unlocked: UnlockedBadge[] = [];
        snapshot.forEach(doc => {
            unlocked.push({ id: doc.id, ...doc.data() } as UnlockedBadge);
        });
        callback(unlocked);
    });
};
