import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { GlobalQuest, QuestCompletion } from '../services/questService';

export default function CompletedQuestsGallery() {
    const { coupleId } = useAuth();
    const [completions, setCompletions] = useState<(QuestCompletion & { questDetails?: GlobalQuest })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!coupleId) return;

        // Listen to quest completions
        const q = query(
            collection(db, 'couples', coupleId, 'quest_completions'),
            orderBy('completed_at', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const completionDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuestCompletion));

            // Fetch the global quest details for each completion so we know what they did
            const enrichedCompletions = await Promise.all(
                completionDocs.map(async (completion) => {
                    try {
                        const questRef = doc(db, 'global_quests', completion.quest_id);
                        const questSnap = await getDoc(questRef);
                        if (questSnap.exists()) {
                            return { ...completion, questDetails: { id: questSnap.id, ...questSnap.data() } as GlobalQuest };
                        }
                    } catch (e) {
                        console.error("Failed to fetch quest details", e);
                    }
                    return completion;
                })
            );

            // Only show completions that successfully linked to a quest title
            setCompletions(
                enrichedCompletions.filter((c): c is QuestCompletion & { questDetails: GlobalQuest } => 'questDetails' in c)
            );
            setLoading(false);
        });

        return unsubscribe;
    }, [coupleId]);

    if (loading || completions.length === 0) return null;

    return (
        <View className="mx-4 mt-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quest History 📖</Text>

            <FlatList
                data={completions}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id || Math.random().toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-2xl w-40 mr-3 border border-gray-100 dark:border-slate-700 overflow-hidden">
                        {item.proof_url ? (
                            <Image
                                source={{ uri: item.proof_url }}
                                className="w-full h-32 bg-gray-200 dark:bg-slate-700"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-32 bg-indigo-50 dark:bg-indigo-900/40 items-center justify-center p-4">
                                <Text className="text-3xl mb-2">🎯</Text>
                                <Text className="text-xs text-center text-indigo-700 dark:text-indigo-300 font-medium" numberOfLines={2}>
                                    {item.proof_text || "Quest Completed!"}
                                </Text>
                            </View>
                        )}

                        <View className="p-3">
                            <Text className="text-xs font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                                {item.questDetails?.title}
                            </Text>
                            <Text className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                                By {item.user_id.substring(0, 4)}...
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
