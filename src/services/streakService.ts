import {
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// --- Types ---

export interface UserStreak {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // YYYY-MM-DD
    updatedAt: any;
}

// --- Helpers ---

/**
 * Returns today's date in YYYY-MM-DD format (local timezone).
 */
const getTodayString = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Returns yesterday's date in YYYY-MM-DD format (local timezone).
 */
const getYesterdayString = (): string => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// --- Streak Logic ---

/**
 * Records user activity and updates streak.
 * - If lastActiveDate === today → no-op
 * - If lastActiveDate === yesterday → increment streak
 * - Otherwise → reset to 1
 */
export const recordActivity = async (spaceId: string, userId: string): Promise<UserStreak> => {
    const streakRef = doc(db, 'couples', spaceId, 'streaks', userId);
    const snap = await getDoc(streakRef);

    const today = getTodayString();
    const yesterday = getYesterdayString();

    let newStreak: UserStreak;

    if (snap.exists()) {
        const data = snap.data() as UserStreak;

        if (data.lastActiveDate === today) {
            // Already active today — no-op
            return data;
        }

        if (data.lastActiveDate === yesterday) {
            // Consecutive day — increment
            const incremented = data.currentStreak + 1;
            newStreak = {
                currentStreak: incremented,
                longestStreak: Math.max(data.longestStreak, incremented),
                lastActiveDate: today,
                updatedAt: serverTimestamp(),
            };
        } else {
            // Streak broken — reset to 1
            newStreak = {
                currentStreak: 1,
                longestStreak: Math.max(data.longestStreak, 1),
                lastActiveDate: today,
                updatedAt: serverTimestamp(),
            };
        }
    } else {
        // First ever activity
        newStreak = {
            currentStreak: 1,
            longestStreak: 1,
            lastActiveDate: today,
            updatedAt: serverTimestamp(),
        };
    }

    await setDoc(streakRef, newStreak);
    return newStreak;
};

/**
 * Real-time listener for a user's streak data.
 */
export const subscribeToStreak = (
    spaceId: string,
    userId: string,
    callback: (streak: UserStreak | null) => void
) => {
    const streakRef = doc(db, 'couples', spaceId, 'streaks', userId);
    return onSnapshot(streakRef, (snap) => {
        if (snap.exists()) {
            callback(snap.data() as UserStreak);
        } else {
            callback(null);
        }
    });
};
