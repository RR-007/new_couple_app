import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { addWishlistItem } from '../../services/giftService';
import { CoupleList, ListItem } from '../../services/listService';

interface GiftIdeaGeneratorProps {
    partnerName?: string;
}

export default function GiftIdeaGenerator({ partnerName }: GiftIdeaGeneratorProps) {
    const { user, activeSpaceId } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [giftIdeas, setGiftIdeas] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateIdeas = async () => {
        if (!activeSpaceId || !user) return;
        setModalVisible(true);
        setIsGenerating(true);
        setError(null);
        setGiftIdeas([]);

        try {
            // 1. Fetch partner's list items for context
            // Note: listService uses 'couples' collection with the spaceId
            const listsRef = collection(db, 'couples', activeSpaceId, 'lists');
            const listsSnapshot = await getDocs(listsRef);

            const listPromises = listsSnapshot.docs.map(async (listDoc) => {
                const listData = listDoc.data() as CoupleList;
                const itemsRef = collection(db, 'couples', activeSpaceId, 'lists', listDoc.id, 'items');
                const itemsSnapshot = await getDocs(itemsRef);
                const items = itemsSnapshot.docs.map(i => i.data() as ListItem);

                // Filter to partner's items
                const partnerItems = items.filter(item => item.addedBy !== user.uid);
                return {
                    name: listData.name,
                    items: partnerItems.map(i => i.text)
                };
            });

            const listsData = await Promise.all(listPromises);

            // Build Context String
            let contextStr = '';
            listsData.forEach(list => {
                if (list.items.length > 0) {
                    contextStr += `List "${list.name}": ${list.items.join(', ')}\n`;
                }
            });

            if (!contextStr) {
                // Return some generic ideas if no lists exist
                contextStr = "They haven't added much to their lists yet, but suggest some universally loved, thoughtful, or romantic gift ideas.";
            }

            // 2. Call Gemini API
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Gemini API key is missing. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
You are a thoughtful gift recommender for a couples app. 
Based on the following context from my partner's to-do / bucket lists, suggest 5 thoughtful, specific gift ideas I could get them.
Keep each idea to a single, short sentence. Do not include introductory text or numbers. Just return 5 lines, one per idea.
Context about their lists:
${contextStr}
`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            // Split by newline and clean up
            const ideas = response.split('\n')
                .map(idea => idea.replace(/^[-*•\d.]\s*/, '').trim())
                .filter(idea => idea.length > 0)
                .slice(0, 5);

            setGiftIdeas(ideas);
        } catch (err: any) {
            console.error('Error generating ideas:', err);
            setError(err.message || 'Failed to generate ideas. Try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddAsSurprise = async (idea: string) => {
        if (!activeSpaceId || !user) return;
        try {
            await addWishlistItem(activeSpaceId, {
                name: idea,
                createdBy: user.uid,
                isSurprise: true, // Marked as surprise
            });
            alert('Added to wishlist as a surprise!');
        } catch (error) {
            console.error('Error adding surprise idea:', error);
            alert('Failed to add idea.');
        }
    };

    return (
        <View className="mb-4">
            <TouchableOpacity
                onPress={handleGenerateIdeas}
                className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-sm"
            >
                <Ionicons name="sparkles" size={20} color="#6366f1" />
                <Text className="font-semibold text-primary-700 dark:text-primary-300">
                    AI Gift Ideas for {partnerName || 'Partner'}
                </Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 h-[70%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold dark:text-white flex-1 text-center">
                                ✨ AI Gift Suggestions
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-1">
                                <Ionicons name="close" size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {isGenerating ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" color="#6366f1" />
                                <Text className="text-gray-500 dark:text-slate-400 mt-4 text-center px-6">
                                    Analyzing their bucket lists and dreaming up the perfect gifts...
                                </Text>
                            </View>
                        ) : error ? (
                            <View className="flex-1 items-center justify-center px-4">
                                <Ionicons name="warning-outline" size={48} color="#ef4444" className="mb-4" />
                                <Text className="text-red-500 text-center mb-6">{error}</Text>
                                <TouchableOpacity
                                    className="bg-primary-500 px-6 py-3 rounded-xl"
                                    onPress={handleGenerateIdeas}
                                >
                                    <Text className="text-white font-semibold">Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                                <Text className="text-gray-500 dark:text-slate-400 mb-4 px-2">
                                    Based on their activity, here are some things they might love:
                                </Text>
                                <View className="gap-3 pb-8">
                                    {giftIdeas.map((idea, index) => (
                                        <View key={index} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-secondary-100 dark:border-secondary-100/20">
                                            <Text className="text-gray-800 dark:text-gray-200 text-base mb-3 leading-relaxed">
                                                {idea}
                                            </Text>
                                            <TouchableOpacity
                                                className="bg-primary-100 dark:bg-primary-900/50 py-2 px-4 rounded-lg self-start flex-row items-center"
                                                onPress={() => handleAddAsSurprise(idea)}
                                            >
                                                <Ionicons name="gift-outline" size={16} color="#4f46e5" className="mr-2" />
                                                <Text className="text-primary-700 dark:text-primary-300 font-medium ml-1">
                                                    Save as Surprise
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
