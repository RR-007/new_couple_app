import {
    addDoc,
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface GlobalQuest {
    id: string; // The Firestore document ID
    quest_id: string; // The quest catalog ID (e.g., daily_goblincam)
    title: string;
    description: string;
    type: 'photo' | 'video' | 'text' | 'audio' | 'irl';
    frequency: 'daily' | 'weekly';
    assigned_at: any; // Firestore timestamp
    expires_in_hours: number;
}

export interface QuestCompletion {
    id?: string;
    quest_id: string; // The global_quests string ID
    user_id: string;
    completed_at: any;
    proof_url?: string;
    proof_text?: string;
}

/**
 * Subscribes to the most recently assigned daily and weekly quests.
 * Returns a callback with { daily: GlobalQuest | null, weekly: GlobalQuest | null }
 */
export const subscribeToActiveQuests = (callback: (quests: { daily: GlobalQuest | null, weekly: GlobalQuest | null }) => void) => {
    const q = query(
        collection(db, 'global_quests'),
        orderBy('assigned_at', 'desc'),
        limit(10) // Fetching a few recent ones
    );

    return onSnapshot(q, (snapshot) => {
        let daily: GlobalQuest | null = null;
        let weekly: GlobalQuest | null = null;

        // The query is ordered descending, so the first one we find of each type is the newest
        snapshot.docs.forEach(doc => {
            const data = doc.data() as Omit<GlobalQuest, 'id'>;
            const quest = { id: doc.id, ...data };

            if (quest.frequency === 'daily' && !daily) {
                daily = quest;
            } else if (quest.frequency === 'weekly' && !weekly) {
                weekly = quest;
            }
        });

        callback({ daily, weekly });
    });
};

/**
 * Subscribes to the completions for a specific couple
 */
export const subscribeToQuestCompletions = (coupleId: string, callback: (completions: QuestCompletion[]) => void) => {
    const q = query(
        collection(db, 'couples', coupleId, 'quest_completions'),
        orderBy('completed_at', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const completions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as QuestCompletion[];

        callback(completions);
    });
};

/**
 * Mark a quest as completed.
 */
export const completeQuest = async (coupleId: string, userId: string, questId: string, proofUrl?: string, proofText?: string) => {
    const completionRef = collection(db, 'couples', coupleId, 'quest_completions');

    const completionData: any = {
        quest_id: questId,
        user_id: userId,
        completed_at: serverTimestamp(),
    };

    if (proofUrl) completionData.proof_url = proofUrl;
    if (proofText) completionData.proof_text = proofText;

    await addDoc(completionRef, completionData);
};
